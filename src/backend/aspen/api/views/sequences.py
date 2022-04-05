import datetime
import json
import os
import re
import threading
from typing import Any, List, Mapping, Optional, Sequence, Set, Union

import sentry_sdk
import sqlalchemy as sa
from boto3 import Session
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncResult, AsyncSession
from sqlalchemy.orm import joinedload, selectinload
from sqlalchemy.orm.exc import NoResultFound
from starlette.requests import Request

from aspen.api.auth import get_auth_user
from aspen.api.deps import get_db, get_settings
from aspen.api.error import http_exceptions as ex
from aspen.api.schemas.sequences import SequenceRequest
from aspen.api.settings import Settings
from aspen.api.utils import (
    authz_samples_cansee,
    check_duplicate_samples,
    check_duplicate_samples_in_request,
    determine_gisaid_status,
    get_matching_gisaid_ids,
    get_missing_and_found_sample_ids,
    FastaStreamer,
)
from aspen.database.models import (
    DataType,
    Location,
    Sample,
    UploadedPathogenGenome,
    User,
)

router = APIRouter()

@router.post("/")
async def prepare_sequences_download(
    request: SequenceRequest,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
):
    # stream output file
    fasta_filename = f"{user.group.name}_sample_sequences.fasta"

    def stream_samples():
        with session_scope(application.DATABASE_INTERFACE) as db_session:
            sample_ids = request.sample_ids
            streamer = FastaStreamer(user, sample_ids, db_session)
            for line in streamer.stream():
                yield line

    # Detach all ORM objects (makes them read-only!) from the DB session for our generator.
    await db.expunge_all()
    generator = stream_samples()
    resp = StreamingResponse(generator, mimetype="application/binary")
    resp.headers["Content-Disposition"] = f"attachment; filename={fasta_filename}"
    return resp