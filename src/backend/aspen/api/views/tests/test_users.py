import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.test_infra.models.usergroup import group_factory, user_factory

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


async def test_users_me(http_client: AsyncClient, async_session: AsyncSession) -> None:
    group = group_factory()
    user = user_factory(group)
    async_session.add(group)
    await async_session.commit()

    response = await http_client.get(
        "/v2/users/me", headers={"user_id": user.auth0_user_id}
    )
    assert response.status_code == 200
    expected = {
        "id": 1,
        "name": "test",
        "group": {"id": 1, "name": "groupname"},
        "acknowledged_policy_version": None,
        "agreed_to_tos": True,
    }
    assert response.json() == expected
