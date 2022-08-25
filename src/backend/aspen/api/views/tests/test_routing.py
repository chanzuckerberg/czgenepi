import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.test_infra.models.usergroup import group_factory, userrole_factory

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


async def test_sample_routing_w_pathogen_slug(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    # test that routing still works with new pathogen_slug optional parameters.
    group = group_factory()
    user = await userrole_factory(async_session, group)
    async_session.add(group)
    async_session.add(user)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}

    # test routing works for both paths,
    # TODO: add more test cases and test response data for when we add more filtering/ query logic based on optional pathogen slug params

    for route in ["samples", "phylo_runs"]:

        res = await http_client.get(
            f"/v2/orgs/{group.id}/{route}/",
            headers=auth_headers,
        )
        assert res.status_code == 200

        res = await http_client.get(
            f"/v2/orgs/{group.id}/pathogens/SC2/{route}/",
            headers=auth_headers,
        )
        assert res.status_code == 200
