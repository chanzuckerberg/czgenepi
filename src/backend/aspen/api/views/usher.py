from typing import List

import sqlalchemy as sa
from fastapi import APIRouter, Depends
from pydantic import parse_obj_as
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

from aspen.api.deps import get_db, get_pathogen
from aspen.api.schemas.usher import UsherTreeVersion, UsherTreeVersionsResponse
from aspen.database.models import Pathogen, UsherOption

router = APIRouter()

USHER_OPTION_SLUGS = {
    "SC2": "wuhCor1",
    "MPX": "mpxv",
}


@router.get("/tree_versions/", response_model=UsherTreeVersionsResponse)
async def get_tree_versions(
    request: Request,
    db: AsyncSession = Depends(get_db),
    pathogen: Pathogen = Depends(get_pathogen),
) -> UsherTreeVersionsResponse:
    options = await db.execute(
        sa.select(UsherOption).order_by(UsherOption.priority.asc())  # type: ignore
    )
    return UsherTreeVersionsResponse(
        usher_options=parse_obj_as(List[UsherTreeVersion], options.scalars().all())
    )
