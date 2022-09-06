import pytest
import sqlalchemy as sa
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.database.models import Pathogen
from aspen.test_infra.models.usergroup import group_factory, userrole_factory

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


async def test_samples_list(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    group = group_factory()
    user = await userrole_factory(async_session, group)
    async_session.add(group)
    await async_session.commit()

    # Load db pathogens
    pathogens = (await async_session.execute(sa.select(Pathogen))).scalars().all()  # type: ignore

    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.get(
        "/v2/pathogens/",
        headers=auth_headers,
    )
    response = res.json()
    for pathogen in pathogens:
        assert pathogen.slug in [item["slug"] for item in response["pathogens"]]
        assert pathogen.name in [item["name"] for item in response["pathogens"]]
    assert len(response["pathogens"]) == len(pathogens)
