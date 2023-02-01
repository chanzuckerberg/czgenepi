from typing import Optional

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.usergroup import user_factory

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


# test LIST locations #


async def test_list_locations(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    # Make multiple locations
    locations: list[list[Optional[str]]] = [
        ["North America", "USA", "California", None],
        ["North America", "USA", "Missouri", "Kansas City"],
        ["Oceania", "Australia", "Queensland", "Brisbane"],
        ["Oceania", "Australia", "Queensland", "Cairns"],
        ["Oceania", "Australia", "Queensland", None],
        ["Oceania", "Australia", None, None],
        ["South America", "Brazil", None, None],
        ["South America", "Argentina", None, None],
        ["South America", None, None, None],
    ]
    for location in locations:
        location = location_factory(location[0], location[1], location[2], location[3])
        async_session.add(location)

    user = user_factory(None)

    async_session.add(user)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    response_obj = await http_client.get(
        "/v2/locations/",
        headers=auth_headers,
    )

    res = response_obj.json()
    assert len(res["locations"]) == 9
    for item in res["locations"]:
        assert [
            item["region"],
            item["country"],
            item["division"],
            item["location"],
        ] in locations


async def test_list_locations_with_depth(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    # Make multiple locations
    locations: list[list[Optional[str]]] = [
        ["North America", "USA", "Missouri", "Kansas City"],
        ["Oceania", "Australia", "Queensland", "Brisbane"],
        ["Oceania", "Australia", "Queensland", "Cairns"],
    ]
    divisions: list[list[Optional[str]]] = [
        ["North America", "USA", "California", None],
        ["Oceania", "Australia", "Queensland", None],
    ]
    countries: list[list[Optional[str]]] = [
        ["Oceania", "Australia", None, None],
        ["South America", "Brazil", None, None],
        ["South America", "Argentina", None, None],
    ]
    regions: list[list[Optional[str]]] = [
        ["Oceania", None, None, None],
        ["South America", None, None, None],
    ]
    for location in locations + divisions + countries + regions:
        location = location_factory(location[0], location[1], location[2], location[3])
        async_session.add(location)

    user = user_factory(None)

    async_session.add(user)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}

    async def check_response(depth: str, valid_rows: list[list[Optional[str]]]):
        response_obj = await http_client.get(
            f"/v2/locations/?max_location_depth={depth}",
            headers=auth_headers,
        )

        res = response_obj.json()
        assert len(res["locations"]) == len(valid_rows)
        for item in res["locations"]:
            assert [
                item["region"],
                item["country"],
                item["division"],
                item["location"],
            ] in valid_rows

    await check_response("location", regions + countries + divisions + locations)
    await check_response("division", regions + countries + divisions)
    await check_response("country", regions + countries)
    await check_response("region", regions)
