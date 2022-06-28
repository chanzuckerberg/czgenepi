import os
from uuid import uuid4

import boto3
import smart_open
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.api.authn import get_auth_user
from aspen.api.deps import get_db, get_settings
from aspen.api.schemas.sequences import (
    FastaURLRequest,
    FastaURLResponse,
    SequenceRequest,
)
from aspen.api.settings import Settings
from aspen.api.utils import FastaStreamer
from aspen.database.models import User

router = APIRouter()


@router.post("/")
async def prepare_sequences_download(
    request: SequenceRequest,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
) -> StreamingResponse:
    # stream output file
    fasta_filename = f"{user.group.name}_sample_sequences.fasta"

    async def stream_samples():
        sample_ids = request.sample_ids
        streamer = FastaStreamer(db, user, sample_ids)
        async for line in streamer.stream():
            yield line

    # Detach all ORM objects (makes them read-only!) from the DB session for our generator.
    db.expunge_all()
    generator = stream_samples()
    resp = StreamingResponse(generator, media_type="application/binary")
    resp.headers["Content-Disposition"] = f"attachment; filename={fasta_filename}"
    return resp


# Writes sample sequence(s) to a FASTA file and uploads it to S3,
# returning a signed url to the S3 object.
@router.post("/getfastaurl")
async def getfastaurl(
    request: FastaURLRequest,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
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
    s3_key = f"fasta-url-files/{user.group.name}/{uuid}.fasta"
    s3_write_fh = smart_open.open(
        f"s3://{s3_bucket}/{s3_key}", "w", transport_params=dict(client=s3_client)
    )
    # Write selected samples to s3
    streamer = FastaStreamer(db, user, sample_ids, downstream_consumer)
    async for line in streamer.stream():
        s3_write_fh.write(line)
    s3_write_fh.close()

    presigned_url = s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": s3_bucket, "Key": s3_key},
        ExpiresIn=3600,
    )

    return FastaURLResponse(url=presigned_url)
