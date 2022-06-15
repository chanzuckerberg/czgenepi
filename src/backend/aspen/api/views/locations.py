import functools

import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlalchemy import asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.expression import and_, literal
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

import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


LOCATION_KEYS = ("region", "country", "division", "location")


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
    # Since most searches are going to be done at the division or location level,
    # if a user includes a country in the query we want to find the closest match
    # for that value and search for divisions and locations *within* that country.
    # The same goes for regions, though in practice including a region is wholly
    # unnecessary.
    set_categories = []
    for category in "region", "country":
        query_value = getattr(search_query, category)
        if query_value is not None:
            category_search_query = (
                sa.select(
                    Location,
                    sa.func.levenshtein(getattr(Location, category), query_value).label(
                        "levenshtein"
                    ),
                )
                .order_by(asc("levenshtein"))
                .limit(1)
            )
            category_result = await db.execute(category_search_query)
            category_value = category_result.scalars().one()
            set_categories.append(
                (getattr(Location, category) == getattr(category_value, category))
            )

    # We generally want to compare on columns with the most specificity.
    comparable_columns = {
        "division": search_query.division,
        "location": search_query.location,
    }
    levenshtein_columns = [
        sa.func.levenshtein(getattr(Location, category), value)
        for category, value in dict(comparable_columns).items()
        if value is not None
    ]
    # But we can also support searches with only a region or country.
    if levenshtein_columns:
        summed_columns = functools.reduce(lambda x, y: x + y, levenshtein_columns)
    else:
        summed_columns = literal(0)

    results = []
    # Allow for searches for a division to show its entry in the locations table
    # where the location column is null
    if (
        comparable_columns["location"] is None
        and comparable_columns["division"] is not None
    ):
        divison_search_query = (
            sa.select(
                Location, sa.sql.expression.label("levenshtein_total", summed_columns)  # type: ignore
            )
            .where(and_(Location.location == None, *set_categories))  # noqa: E711
            .order_by(asc("levenshtein_total"))
            .limit(1)
        )
        division_search = await db.execute(divison_search_query)
        closest_division = division_search.scalars().one()
        results.append(closest_division)

    location_search_query = (
        sa.select(
            Location, sa.sql.expression.label("levenshtein_total", summed_columns)  # type: ignore
        )
        .where(and_(Location.location != None, *set_categories))  # noqa: E711
        .order_by(asc("levenshtein_total"))
        .limit(20)
    )

    location_search = await db.execute(location_search_query)
    locations = location_search.scalars().all()
    results.extend(locations)

    return LocationListResponse.parse_obj({"locations": results})
