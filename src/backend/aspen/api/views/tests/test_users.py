from datetime import datetime
from typing import Dict, List

import pytest
import sqlalchemy as sa
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.api.views.tests.data.auth0_mock_responses import DEFAULT_AUTH0_USER
from aspen.auth.auth0_management import Auth0Client
from aspen.database.models import User
from aspen.test_infra.models.usergroup import group_factory, userrole_factory

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


async def test_users_me(http_client: AsyncClient, async_session: AsyncSession) -> None:
    group = group_factory()
    user = await userrole_factory(async_session, group)
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
        "groups": [
            {"id": group.id, "name": group.name, "roles": ["member"]},
        ],
    }
    resp_data = response.json()
    for key in expected:
        assert resp_data[key] == expected[key]
    assert len(resp_data["split_id"]) == 20


async def test_users_view_put_pass(
    auth0_apiclient: Auth0Client,
    http_client: AsyncClient,
    async_session: AsyncSession,
):
    group = group_factory()
    user = await userrole_factory(async_session, group, agreed_to_tos=False)
    async_session.add(group)
    await async_session.commit()

    new_name = "Alice Alison"
    auth0_apiclient.update_user.return_value = DEFAULT_AUTH0_USER.copy().update(  # type: ignore
        name=new_name
    )

    headers = {"user_id": user.auth0_user_id}
    requests: List[Dict] = [
        {"agreed_to_tos": True, "acknowledged_policy_version": "2022-06-22"},
        {"agreed_to_tos": False},
        {"acknowledged_policy_version": "2020-07-22"},
        {"name": new_name},
    ]
    for req in requests:
        res = await http_client.put("/v2/users/me", headers=headers, json=req)
        assert res.status_code == 200

        # start a new transaction
        await async_session.close()
        async_session.begin()
        updated_user = (
            (
                await async_session.execute(
                    sa.select(User).filter(User.auth0_user_id == user.auth0_user_id)  # type: ignore
                )
            )
            .scalars()
            .one()
        )
        if "agreed_to_tos" in req:
            assert updated_user.agreed_to_tos == req["agreed_to_tos"]
        if "acknowledged_policy_verison" in req:
            assert (
                updated_user.acknowledged_policy_version
                == datetime.strptime(
                    req["acknowledged_policy_version"], "%Y-%m-%d"
                ).date()
            )
        if "name" in req:
            assert updated_user.name == req["name"]


async def test_usergroup_view_put_fail(
    http_client: AsyncClient, async_session: AsyncSession
):
    group = group_factory()
    user = await userrole_factory(async_session, group, agreed_to_tos=False)
    async_session.add(group)
    await async_session.commit()
    headers = {"user_id": user.auth0_user_id}
    bad_requests = [
        {"agreed_to_tos": 11, "acknowledged_policy_version": "2022-06-22"},
        {"agreed_to_tos": True, "acknowledged_policy_version": "hello"},
    ]
    for req in bad_requests:
        res = await http_client.put("/v2/users/me", headers=headers, json=req)
        assert res.status_code == 422
