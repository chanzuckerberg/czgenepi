import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.test_infra.models.usergroup import group_factory, user_factory

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


async def test_list_members(
    http_client: AsyncClient, async_session: AsyncSession
) -> None:
    group = group_factory()
    user = user_factory(
        group, name="Bob", auth0_user_id="testid02", email="bob@dph.org"
    )
    user2 = user_factory(
        group,
        name="Alice",
        auth0_user_id="testid01",
        email="alice@dph.org",
        group_admin=True,
    )
    async_session.add(group)
    await async_session.commit()

    response = await http_client.get(
        f"/v2/groups/{group.id}/members", headers={"user_id": user.auth0_user_id}
    )
    assert response.status_code == 200
    expected = {
        "members": [
            {
                "id": user2.id,
                "name": user2.name,
                "agreed_to_tos": True,
                "acknowledged_policy_version": None,
                "email": user2.email,
                "group_admin": True,
            },
            {
                "id": user.id,
                "name": user.name,
                "agreed_to_tos": True,
                "acknowledged_policy_version": None,
                "email": user.email,
                "group_admin": False,
            },
        ]
    }
    resp_data = response.json()
    for key in expected:
        assert resp_data[key] == expected[key]


async def test_list_members_unauthorized(
    http_client: AsyncClient, async_session: AsyncSession
) -> None:
    group = group_factory()
    group2 = group_factory(name="test_group2")
    user = user_factory(
        group, name="Bob", auth0_user_id="testid02", email="bob@dph.org"
    )
    user2 = user_factory(
        group2, name="Alice", auth0_user_id="testid01", email="alice@dph.org"
    )
    async_session.add_all([group, group2, user, user2])
    await async_session.commit()

    response = await http_client.get(
        f"/v2/groups/{group2.id}/members", headers={"user_id": user.auth0_user_id}
    )
    assert response.status_code == 403


async def test_list_group_invitations(
    http_client: AsyncClient, async_session: AsyncSession
) -> None:
    group = group_factory()
    user = user_factory(group)
    async_session.add_all([group, user])
    await async_session.commit()

    response = await http_client.get(
        f"/v2/groups/{group2.id}/invitations", headers={"user_id": user.auth0_user_id}
    )
    assert response.status_code == 200


async def test_list_group_invitations_unauthorized(
    http_client: AsyncClient, async_session: AsyncSession
) -> None:
    group = group_factory()
    group2 = group_factory(name="test_group2")
    user = user_factory(
        group, name="Bob", auth0_user_id="testid02", email="bob@dph.org"
    )
    user2 = user_factory(
        group2, name="Alice", auth0_user_id="testid01", email="alice@dph.org"
    )
    async_session.add_all([group, group2, user, user2])
    await async_session.commit()

    response = await http_client.get(
        f"/v2/groups/{group2.id}/invitations", headers={"user_id": user.auth0_user_id}
    )
    assert response.status_code == 403
