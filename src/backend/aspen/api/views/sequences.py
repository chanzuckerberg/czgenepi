import os
from datetime import datetime
from uuid import uuid4

import boto3
import smart_open
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

import aspen.api.error.http_exceptions as ex
from aspen.api.authn import AuthContext, get_auth_context
from aspen.api.authz import AuthZSession, get_authz_session
from aspen.api.deps import get_db, get_pathogen, get_settings
from aspen.api.schemas.sequences import (
    FastaURLRequest,
    FastaURLResponse,
    SequenceRequest,
)
from aspen.api.settings import APISettings
from aspen.api.utils import get_public_repository_prefix
from aspen.api.utils.fasta_streamer import FastaStreamer
from aspen.database.models import Pathogen

router = APIRouter()


def get_fasta_filename(public_repository_name, group_name):
    # get filename depending on public_repository, else default to generic filename with group name
    todays_date = datetime.today().strftime("%Y%m%d")
    if public_repository_name is not None:
        return f"{todays_date}_{public_repository_name}_sequences.fasta"
    # user wants to download samples with no intent to submit to a public repository
    return f"{group_name}_sample_sequences.fasta"


@router.post("/")
async def prepare_sequences_download(
    request: SequenceRequest,
    db: AsyncSession = Depends(get_db),
    az: AuthZSession = Depends(get_authz_session),
    ac: AuthContext = Depends(get_auth_context),
    pathogen: Pathogen = Depends(get_pathogen),
) -> StreamingResponse:
    # stream output file
    fasta_filename = get_fasta_filename(request.public_repository_name, ac.group.name)  # type: ignore

    # get the sample id prefix for given public_repository
    prefix = await get_public_repository_prefix(
        pathogen, request.public_repository_name, db
    )
    prefix_should_exist = (
        pathogen is not None and request.public_repository_name is not None
    )
    if prefix is None and prefix_should_exist:
        raise ex.ServerException(
            "no prefix found for given pathogen_slug and public_repository combination"
        )

    async def stream_samples():
        sample_ids = request.sample_ids
        streamer = FastaStreamer(db, az, ac, pathogen, set(sample_ids), prefix=prefix)
        async for line in streamer.stream():
            yield line

    # Detach all ORM objects (makes them read-only!) from the DB session for our generator.
    db.expunge_all()
    generator = stream_samples()
    resp = StreamingResponse(generator, media_type="application/binary")
    # Access-Control-Expose-Headers needed for FE to read Content-Disposition to get filename
    resp.headers["Access-Control-Expose-Headers"] = "Content-Disposition"
    resp.headers["Content-Disposition"] = f"attachment; filename={fasta_filename}"
    return resp


# Writes sample sequence(s) to a FASTA file and uploads it to S3,
# returning a signed url to the S3 object.
@router.post("/getfastaurl")
async def getfastaurl(
    request: FastaURLRequest,
    db: AsyncSession = Depends(get_db),
    settings: APISettings = Depends(get_settings),
    az: AuthZSession = Depends(get_authz_session),
    ac: AuthContext = Depends(get_auth_context),
    pathogen: Pathogen = Depends(get_pathogen),
) -> FastaURLResponse:
    sample_ids = request.samples
    downstream_consumer = request.downstream_consumer

    s3_bucket = settings.EXTERNAL_AUSPICE_BUCKET
    s3_resource = boto3.resource(
        "s3",
        endpoint_url=os.getenv("BOTO_ENDPOINT_URL") or None,
        config=boto3.session.Config(signature_version="s3v4"),
    )
    s3_client = s3_resource.meta.client
    uuid = uuid4()
    s3_key = f"fasta-url-files/{ac.group.name}/{uuid}.fasta"  # type: ignore
    s3_write_fh = smart_open.open(
        f"s3://{s3_bucket}/{s3_key}", "w", transport_params=dict(client=s3_client)
    )
    # Write selected samples to s3
    streamer = FastaStreamer(db, az, ac, pathogen, set(sample_ids), downstream_consumer)
    async for line in streamer.stream():
        s3_write_fh.write(line)
    s3_write_fh.close()

    presigned_url = s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": s3_bucket, "Key": s3_key},
        ExpiresIn=3600,
    )

    return FastaURLResponse(url=presigned_url)
