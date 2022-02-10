from typing import List

import sqlalchemy as sa
from fastapi import APIRouter, Depends
from pydantic import parse_obj_as
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

from aspen.api.deps import get_db
from aspen.api.schemas.usher import UsherTreeVersion, UsherTreeVersionsResponse
from aspen.database.models.usher import UsherOption

router = APIRouter()


@router.get("/tree_versions/", response_model=UsherTreeVersionsResponse)
async def get_tree_versions(
    request: Request, db: AsyncSession = Depends(get_db)
) -> UsherTreeVersionsResponse:
    options = await db.execute(
        sa.select(UsherOption).order_by(UsherOption.priority.asc())  # type: ignore
    )
    return UsherTreeVersionsResponse(
        usher_options=parse_obj_as(List[UsherTreeVersion], options.scalars().all())
    )
