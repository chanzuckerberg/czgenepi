import functools
from enum import Enum
from typing import Dict, List, Optional

import sqlalchemy as sa
from fastapi import APIRouter, Depends, Query
from sqlalchemy import asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.expression import and_, BinaryExpression
from starlette.requests import Request

from aspen.api.authn import get_auth_user
from aspen.api.deps import get_db, get_settings
from aspen.api.schemas.locations import (
    LocationListResponse,
    LocationResponse,
    LocationSearchRequest,
)
from aspen.api.settings import APISettings
from aspen.database.models import Location, User

router = APIRouter()


LOCATION_KEYS = ("region", "country", "division", "location")
LOCATION_DEPTH = ["region", "country", "division", "location"]


class LocationDepthEnum(str, Enum):
    LOCATION = "location"
    DIVISION = "division"
    COUNTRY = "country"
    REGION = "region"


@router.get("/", response_model=LocationListResponse)
async def list_locations(
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: APISettings = Depends(get_settings),
    user: User = Depends(get_auth_user),
    max_location_depth: LocationDepthEnum = Query(default=LocationDepthEnum.LOCATION),
) -> LocationListResponse:

    # load the locations.
    all_locations_query = sa.select(Location)  # type: ignore
    # Find out which columns need to be forced to null based on our max location depth
    required_null_columns = LOCATION_DEPTH[
        LOCATION_DEPTH.index(max_location_depth) + 1 :
    ]
    # Add null filters to our query
    for col in required_null_columns:
        all_locations_query = all_locations_query.where(
            getattr(Location, col) == None  # noqa: E711
        )
    result = await db.execute(all_locations_query)
    response = []
    for row in result.scalars():
        response.append(LocationResponse.from_orm(row))

    return LocationListResponse.parse_obj({"locations": response})


# The idea in this route is that,
# given a country, show all divisions in that country,
# given a division, show all locations in that division,
# given a location, do a text-distance-based search for that location,
# and restrict searches based on higher-order category values.
@router.post("/search/")
async def search_locations(
    search_query: LocationSearchRequest,
    db: AsyncSession = Depends(get_db),
    settings: APISettings = Depends(get_settings),
    user: User = Depends(get_auth_user),
):
    set_categories: Dict[str, Optional[str]] = {
        "region": None,
        "country": None,
        "division": None,
    }
    set_category_conditionals: List[BinaryExpression] = []
    for category in set_categories.keys():
        query_value = getattr(search_query, category)
        if query_value is not None:
            target_column = getattr(Location, category)
            category_search_query = (
                sa.select(
                    target_column.distinct(),
                    sa.func.levenshtein(
                        sa.func.lower(target_column), sa.func.lower(query_value)
                    ).label("levenshtein"),
                )
                .where(and_(True, *set_category_conditionals))
                .order_by(asc("levenshtein"))
                .limit(1)
            )
            category_result = await db.execute(category_search_query)
            category_value = category_result.scalars().one()
            set_categories[category] = category_value
            set_category_conditionals.append(
                getattr(Location, category) == category_value
            )

    levenshtein_columns = [
        sa.func.levenshtein(
            sa.func.lower(getattr(Location, category)), sa.func.lower(value)
        )
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
        country_search_query = sa.select(Location).where(  # type: ignore
            and_(
                Location.country == set_categories["country"],
                Location.division == None,  # noqa: E711
                Location.location == None,  # noqa: E711
            )
        )
        country_search = await db.execute(country_search_query)
        closest_country = country_search.scalars().one()
        results.append(closest_country)

        divisions_search_query = (
            sa.select(Location)  # type: ignore
            .where(
                and_(
                    Location.country == set_categories["country"],
                    Location.division != None,  # noqa: E711
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
        and_arguments = [
            Location.division == set_categories["division"],
            Location.location == None,  # noqa: E711,
        ]
        if set_categories["country"]:
            and_arguments.append(Location.country == set_categories["country"])
        divison_search_query = sa.select(Location).where(  # type: ignore
            and_(True, *and_arguments)
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
