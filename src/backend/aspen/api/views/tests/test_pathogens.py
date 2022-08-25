import pytest
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

    # Make multiple pathogens
    p1 = Pathogen(slug="SC2", name="SARS-CoV-2")
    p2 = Pathogen(slug="MPX", name="monkey pox")

    async_session.add(group)
    async_session.add(p1)
    async_session.add(p2)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.get(
        "/v2/pathogens/",
        headers=auth_headers,
    )
    response = res.json()
    expected = {
        "pathogens": [
            {
                "id": p1.id,
                "slug": p1.slug,
                "name": p1.name,
            },
            {"id": p2.id, "slug": p2.slug, "name": p2.name},
        ]
    }
    assert response == expected
