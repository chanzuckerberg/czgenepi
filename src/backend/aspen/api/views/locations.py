import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

from aspen.api.auth import get_auth_user
from aspen.api.deps import get_db, get_settings
from aspen.api.schemas.locations import LocationListResponse, LocationResponse, LocationSearchRequest
from aspen.api.settings import Settings
from aspen.database.models import Location, User

router = APIRouter()

import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

@router.get("/", response_model=LocationListResponse)
async def list_locations(
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
) -> LocationListResponse:

    # load the locations.
    all_locations_query = sa.select(Location)  # type: ignore
    result = await db.execute(all_locations_query)
    response = []
    for row in result.scalars():
        response.append(LocationResponse.from_orm(row))

    return LocationListResponse.parse_obj({"locations": response})


@router.post("/search/")
async def search_locations(
    search_query: LocationSearchRequest,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
):
    logger.debug(search_query)

    # levenshtein_subquery = sa.select(Location, sa.func.levenshtein())
    # search_locations_query = sa.select(Location).filter()
    return search_query