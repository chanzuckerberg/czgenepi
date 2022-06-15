import functools

import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlalchemy import asc
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

from aspen.api.auth import get_auth_user
from aspen.api.deps import get_db, get_settings
from aspen.api.schemas.locations import (
    LocationListResponse,
    LocationResponse,
    LocationSearchRequest,
)
from aspen.api.settings import Settings
from aspen.database.models import Location, User

router = APIRouter()


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
    levenshtein_columns = [
        sa.func.levenshtein(getattr(Location, category), value)
        for category, value in dict(search_query).items()
        if value is not None
    ]

    summed_columns = functools.reduce(lambda x, y: x + y, levenshtein_columns)

    results = []

    # Allow for searches for a division to show its entry in the locations table
    # where the location column is null
    if search_query.location is None:
        divison_search_query = (
            sa.select(
                Location, sa.sql.expression.label("levenshtein_total", summed_columns)  # type: ignore
            )
            .where(Location.location == None)  # noqa: E711
            .order_by(asc("levenshtein_total"))
            .limit(1)
        )
        division_search = await db.execute(divison_search_query)
        closest_division = division_search.scalars().one_or_none()
        results.append(closest_division)

    location_search_query = (
        sa.select(
            Location, sa.sql.expression.label("levenshtein_total", summed_columns)  # type: ignore
        )
        .where(Location.location != None)  # noqa: E711
        .order_by(asc("levenshtein_total"))
        .limit(20)
    )

    location_search = await db.execute(location_search_query)
    locations = location_search.scalars().all()
    results.extend(locations)

    return LocationListResponse.parse_obj({"locations": results})
