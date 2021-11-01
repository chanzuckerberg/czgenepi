import datetime
import json
import os
import re
from typing import MutableSequence

import sentry_sdk
import sqlalchemy as sa
from boto3 import Session
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from sqlalchemy.orm.exc import NoResultFound
from starlette.requests import Request

from aspen.api.auth import get_auth_user
from aspen.api.deps import get_db, get_settings
from aspen.api.error import http_exceptions as ex
from aspen.api.schemas.phylo_trees import (
    PhyloTreeRequestSchema, PhyloTreeResponseSchema,
)
from aspen.api.settings import Settings
from aspen.api.utils import get_matching_gisaid_ids
from aspen.app.views.api_utils import (
    authz_sample_filters,
    get_missing_and_found_sample_ids,
)
from aspen.database.models import (
    User,
    AlignedGisaidDump,
    PathogenGenome,
    PhyloRun,
    Sample,
    TreeType,
    Workflow,
    WorkflowStatusType,
)

router = APIRouter()


@router.get("/")
async def list_trees(
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
) -> bool:
    return False

@router.delete("/{tree_id}")
async def delete_tree(
    tree_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
) -> bool:
    return False
