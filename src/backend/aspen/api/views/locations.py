import functools
from typing import Dict, Optional

import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlalchemy import asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.expression import and_
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
    set_categories: Dict[str, Optional[str]] = {
        "region": None,
        "country": None,
        "division": None,
    }
    for category in set_categories.keys():
        query_value = getattr(search_query, category)
        if query_value is not None:
            target_column = getattr(Location, category)
            category_search_query = (
                sa.select(
                    target_column.distinct(),
                    sa.func.levenshtein(target_column, query_value).label(
                        "levenshtein"
                    ),
                )
                .order_by(asc("levenshtein"))
                .limit(1)
            )
            category_result = await db.execute(category_search_query)
            category_value = category_result.scalars().one()
            set_categories[category] = category_value

    set_category_conditionals = [
        (getattr(Location, category) == location_match)
        for category, location_match in set_categories.items()
        if location_match is not None
    ]

    levenshtein_columns = [
        sa.func.levenshtein(getattr(Location, category), value)
        for category, value in dict(search_query).items()
        if value is not None
    ]
    summed_columns = functools.reduce(lambda x, y: x + y, levenshtein_columns)

    results = []
    # show all divisions in a country
    if (
        search_query.country
        and search_query.division is None
        and search_query.location is None
    ):
        divisions_search_query = (
            sa.select(Location)  # type: ignore
            .where(
                and_(
                    Location.country == set_categories["country"],
                    Location.location == None,  # noqa: E711
                )
            )
            .order_by(asc(Location.division))
        )
        divisions_search = await db.execute(divisions_search_query)
        all_divisions_in_country = divisions_search.scalars().all()
        results.extend(all_divisions_in_country)
    # show all locations in a division
    elif search_query.location is None and search_query.division:
        divison_search_query = (
            sa.select(
                Location, sa.sql.expression.label("levenshtein_total", summed_columns)  # type: ignore
            )
            .where(
                and_(
                    Location.location == None, *set_category_conditionals  # noqa: E711
                )
            )
            .order_by(asc("levenshtein_total"))
            .limit(1)
        )
        division_search = await db.execute(divison_search_query)
        closest_division = division_search.scalars().one()
        results.append(closest_division)

        all_locations_in_division_query = (
            sa.select(Location)  # type: ignore
            .where(
                and_(
                    Location.region == closest_division.region,
                    Location.country == closest_division.country,
                    Location.division == closest_division.division,
                    Location.location != None,  # noqa: E711
                )
            )
            .order_by(asc(Location.location))
        )
        all_locations_in_division_result = await db.execute(
            all_locations_in_division_query
        )
        all_locations_in_division = all_locations_in_division_result.scalars().all()
        results.extend(all_locations_in_division)
    else:
        location_search_query = (
            sa.select(
                Location, sa.sql.expression.label("levenshtein_total", summed_columns)  # type: ignore
            )
            .where(
                and_(
                    Location.location != None, *set_category_conditionals  # noqa: E711
                )
            )
            .order_by(asc("levenshtein_total"))
            .limit(30)
        )

        location_search = await db.execute(location_search_query)
        locations = location_search.scalars().all()
        results.extend(locations)

    return LocationListResponse.parse_obj({"locations": results})
