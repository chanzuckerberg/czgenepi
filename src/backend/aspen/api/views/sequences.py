from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.api.auth import get_auth_user
from aspen.api.deps import get_db, get_settings
from aspen.api.schemas.sequences import SequenceRequest
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
):
    # stream output file
    print("Request: ", request)
    fasta_filename = f"{user.group.name}_sample_sequences.fasta"

    async def stream_samples():
        sample_ids = request.sample_ids
        streamer = FastaStreamer(user, sample_ids)
        async for line in streamer.stream(db):
            yield line

    # Detach all ORM objects (makes them read-only!) from the DB session for our generator.
    db.expunge_all()
    generator = stream_samples()
    resp = StreamingResponse(generator, media_type="application/binary")
    resp.headers["Content-Disposition"] = f"attachment; filename={fasta_filename}"
    return resp
