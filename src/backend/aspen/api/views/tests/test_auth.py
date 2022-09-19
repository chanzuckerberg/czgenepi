from typing import List, Set, Tuple

import pytest
import sqlalchemy as sa
from authlib.integrations.starlette_client import StarletteOAuth2App
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from aspen.api.views.auth import create_user_if_not_exists
from aspen.auth.auth0_management import Auth0Client
from aspen.auth.role_manager import RoleManager
from aspen.database.models import Group, User, UserRole
from aspen.test_infra.models.usergroup import (
    group_factory,
    user_factory,
    userrole_factory,
)
from aspen.util.split import SplitClient

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


async def start_new_transaction(session: AsyncSession):
    await session.commit()
    await session.close()
    session.begin()


async def check_roles(
    async_session: AsyncSession,
    auth0_user_id: str,
    expected_roles: Set[Tuple[str, str]],
):
    db_roles = (
        (
            await async_session.execute(
                sa.select(User)  # type: ignore
                .options(
                    joinedload(User.user_roles, innerjoin=True).options(  # type: ignore
                        joinedload(UserRole.group, innerjoin=True),  # type: ignore
                        joinedload(UserRole.role, innerjoin=True),
                    )  # type: ignore
                )
                .filter(User.auth0_user_id == auth0_user_id)  # type: ignore
            )
        )
        .scalars()
        .unique()
        .all()
    )
    actual_roles = set()
    for user in db_roles:
        for user_role in user.user_roles:
            actual_roles.add((user_role.group.auth0_org_id, user_role.role.name))
    print(f"expected: {expected_roles}")
    print(f"actual: {actual_roles}")
    assert expected_roles == actual_roles


async def test_create_new_user_if_not_exists(
    async_session: AsyncSession,
    auth0_apiclient: Auth0Client,
):
    """
    Test creating a new auth0 user on login
    """
    userinfo = {
        "sub": "user123-asdf",
        "org_id": "123456",
        "email": "hello@czgenepi.org",
    }
    group = group_factory(auth0_org_id=userinfo["org_id"])
    async_session.add(group)
    auth0_apiclient.get_org_user_roles.side_effect = [["member"]]  # type: ignore
    await start_new_transaction(async_session)
    await create_user_if_not_exists(async_session, userinfo)
    await start_new_transaction(async_session)
    user = (
        (
            await async_session.execute(
                sa.select(User).filter(  # type: ignore
                    User.auth0_user_id == userinfo["sub"]
                )  # type: ignore
            )
        )
        .scalars()
        .one()
    )
    assert user.email == userinfo["email"]


async def test_dont_create_new_user_if_exists(
    async_session: AsyncSession,
    auth0_apiclient: Auth0Client,
):
    """
    Test creating a new auth0 user on login
    """
    userinfo = {
        "sub": "user123-asdf",
        "org_id": "123456",
        "email": "hello@czgenepi.org",
    }
    group = group_factory(auth0_org_id=userinfo["org_id"])
    user = await userrole_factory(
        async_session, auth0_user_id=userinfo["sub"], group=group
    )
    async_session.add(user)
    await start_new_transaction(async_session)
    await create_user_if_not_exists(async_session, userinfo)
    original_user_id = user.id
    async_session.expire_all()
    await start_new_transaction(async_session)
    db_user = (
        (
            await async_session.execute(
                sa.select(User).filter(  # type: ignore
                    User.auth0_user_id == userinfo["sub"]
                )  # type: ignore
            )
        )
        .scalars()
        .one()
    )
    assert db_user.id == original_user_id


async def test_create_new_user_and_sync_roles(
    async_session: AsyncSession,
    auth0_apiclient: Auth0Client,
):
    """
    Test creating a new auth0 user on login and syncing its roles
    """
    userinfo = {
        "sub": "user123-asdf",
        "org_id": "group1",
        "email": "hello@czgenepi.org",
    }
    group1 = group_factory(name="Group 1", auth0_org_id=userinfo["org_id"])
    group2 = group_factory(name="Group 2", auth0_org_id="group2")
    group3 = group_factory(name="Group 3", auth0_org_id="group3")
    async_session.add_all([group1, group2, group3])
    auth0_apiclient.get_org_user_roles.side_effect = [["member"], ["admin"]]  # type: ignore
    auth0_apiclient.get_user_orgs.side_effect = [[{"id": group1.auth0_org_id}, {"id": group3.auth0_org_id}]]  # type: ignore
    await start_new_transaction(async_session)
    user_obj, _ = await create_user_if_not_exists(async_session, userinfo)
    assert user_obj is not None
    await RoleManager.sync_user_roles(async_session, auth0_apiclient, user_obj)
    assert user_obj.email == userinfo["email"]

    await start_new_transaction(async_session)
    user = (
        (
            await async_session.execute(
                sa.select(User).filter(  # type: ignore
                    User.auth0_user_id == userinfo["sub"]
                )  # type: ignore
            )
        )
        .scalars()
        .one()
    )
    assert user.email == userinfo["email"]
    expected_roles = {(group1.auth0_org_id, "member"), (group3.auth0_org_id, "admin")}
    await check_roles(async_session, user.auth0_user_id, expected_roles)


async def test_sync_complicated_roles(
    async_session: AsyncSession,
    auth0_apiclient: Auth0Client,
):
    """
    Test Sync'ing roles.
    """
    groups = [
        group_factory(name=f"Group {i}", auth0_org_id=f"group{i}") for i in range(12)
    ]
    # NOTE -- the groups passed to user factory are irrelevant here.
    users = [
        user_factory(
            name=f"User {i}",
            email=f"user{i}@czgenepi.org",
            auth0_user_id=f"user{i}",
            group=groups[0],
        )
        for i in range(4)
    ]
    async_session.add_all(users + groups)
    await start_new_transaction(async_session)

    # NOTE - DO NOT USE groups[0] in our test for fear of the SA identity map dragon!!!
    matrix: List[Tuple[User, List[Tuple[Group, str]], List[Tuple[Group, str]]]] = [
        # Add a role where there was nothing
        (users[0], [], [(groups[1], "admin")]),
        # leave one role intact and add another
        (
            users[1],
            [(groups[2], "member")],
            [(groups[2], "member"), (groups[3], "admin")],
        ),
        # wipe everything out
        (
            users[2],
            [(groups[3], "member"), (groups[4], "member"), (groups[5], "member")],
            [],
        ),
        # add and remove 2 of each
        (
            users[3],
            [(groups[6], "member"), (groups[7], "member"), (groups[8], "member")],
            [(groups[6], "member"), (groups[9], "admin"), (groups[10], "member")],
        ),
    ]

    # Back to our regularly scheduled testing programming
    for user, starting_roles, final_roles in matrix:
        for group, role in starting_roles:
            async_session.add(
                await RoleManager.generate_user_role(async_session, user, group, role)
            )
        orgs_response = [{"id": group.auth0_org_id} for group, _ in final_roles]
        members_responses = [[role] for _, role in final_roles]
        auth0_apiclient.get_org_user_roles.side_effect = members_responses  # type: ignore
        auth0_apiclient.get_user_orgs.side_effect = [orgs_response]  # type: ignore
        await RoleManager.sync_user_roles(async_session, auth0_apiclient, user)
        await start_new_transaction(async_session)

        expected_roles = set(
            [(group.auth0_org_id, role) for group, role in final_roles]
        )
        await check_roles(async_session, user.auth0_user_id, expected_roles)


async def test_callback_syncs_auth0_user_roles(
    async_session: AsyncSession,
    auth0_apiclient: Auth0Client,
    auth0_oauth: StarletteOAuth2App,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    userinfo = {
        "sub": "auth0|user123-asdf",
        "org_id": "123456",
        "email": "hello@czgenepi.org",
        "name": "Bob",
    }
    group = group_factory(auth0_org_id=userinfo["org_id"])
    async_session.add(group)
    await async_session.commit()

    auth0_apiclient.get_org_user_roles.side_effect = [["admin"]]  # type: ignore
    auth0_oauth.authorize_access_token.side_effect = [{"userinfo": userinfo}]  # type: ignore
    auth0_apiclient.get_user_orgs.side_effect = [[]]  # type: ignore

    res = await http_client.get(
        "/v2/auth/callback",
        allow_redirects=False,
    )
    assert res.status_code == 307
    assert auth0_apiclient.get_user_orgs.call_count == 1  # type: ignore


async def test_callback_doesnt_sync_localdev_roles(
    async_session: AsyncSession,
    auth0_apiclient: Auth0Client,
    auth0_oauth: StarletteOAuth2App,
    http_client: AsyncClient,
):
    userinfo = {
        "sub": "User1",
        "org_id": "123456",
        "email": "hello@czgenepi.org",
        "name": "Bob",
    }
    group = group_factory(auth0_org_id=userinfo["org_id"])
    async_session.add(group)
    await async_session.commit()

    auth0_apiclient.get_org_user_roles.side_effect = [["admin"]]  # type: ignore
    auth0_oauth.authorize_access_token.side_effect = [{"userinfo": userinfo}]  # type: ignore

    res = await http_client.get(
        "/v2/auth/callback",
        allow_redirects=False,
    )
    assert res.status_code == 307
    assert auth0_apiclient.get_user_orgs.call_count == 0  # type: ignore


async def test_callback_ff_doesnt_sync_auth0_user_roles(
    async_session: AsyncSession,
    auth0_apiclient: Auth0Client,
    auth0_oauth: StarletteOAuth2App,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    userinfo = {
        "sub": "auth0|user123-asdf",
        "org_id": "123456",
        "email": "hello@czgenepi.org",
        "name": "Bob",
    }
    group = group_factory(auth0_org_id=userinfo["org_id"])
    async_session.add(group)
    await async_session.commit()

    auth0_apiclient.get_org_user_roles.side_effect = [["admin"]]  # type: ignore
    auth0_oauth.authorize_access_token.side_effect = [{"userinfo": userinfo}]  # type: ignore
    auth0_apiclient.get_user_orgs.side_effect = [[]]  # type: ignore

    res = await http_client.get(
        "/v2/auth/callback",
        allow_redirects=False,
    )
    assert res.status_code == 307
    assert auth0_apiclient.get_user_orgs.call_count == 0  # type: ignore

    # Make sure our new user got added to the db.
    user = (
        (
            await async_session.execute(
                sa.select(User).filter(  # type: ignore
                    User.auth0_user_id == userinfo["sub"]
                )  # type: ignore
            )
        )
        .scalars()
        .one()
    )
    assert user.auth0_user_id == userinfo["sub"]


async def test_callback_error_redirects(
    http_client: AsyncClient,
):
    res = await http_client.get(
        "/v2/auth/callback",
        allow_redirects=False,
        params={"error_description": "invitation not found or already used"},
    )
    assert res.status_code == 307
    assert res.is_redirect
    assert "already_accepted" in res.headers["Location"]

    res = await http_client.get(
        "/v2/auth/callback",
        allow_redirects=False,
        params={"error_description": "expired"},
    )
    assert res.status_code == 307
    assert res.is_redirect
    assert "expired" in res.headers["Location"]


async def test_redirect_to_samples_if_exists(
    async_session: AsyncSession,
    auth0_apiclient: Auth0Client,
    auth0_oauth: StarletteOAuth2App,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    """
    Test creating a new auth0 user on login
    """
    userinfo = {
        "sub": "user123-asdf",
        "org_id": "123456",
        "email": "hello@czgenepi.org",
        "name": "Name Goes Here",
    }
    group = group_factory(auth0_org_id=userinfo["org_id"])
    user = await userrole_factory(
        async_session, auth0_user_id=userinfo["sub"], group=group
    )
    async_session.add(user)
    await async_session.commit()

    auth0_apiclient.get_org_user_roles.side_effect = [["admin"]]  # type: ignore
    auth0_oauth.authorize_access_token.side_effect = [{"userinfo": userinfo}]  # type: ignore
    auth0_apiclient.get_user_orgs.side_effect = [[]]  # type: ignore

    res = await http_client.get(
        "/v2/auth/callback",
        allow_redirects=False,
    )
    assert res.status_code == 307
    assert auth0_apiclient.get_user_orgs.call_count == 0  # type: ignore
    assert res.is_redirect
    assert "data/samples" in res.headers["Location"]


async def test_redirect_to_group_welcome_if_new(
    async_session: AsyncSession,
    auth0_apiclient: Auth0Client,
    auth0_oauth: StarletteOAuth2App,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    """
    Test creating a new auth0 user on login
    """
    userinfo = {
        "sub": "user123-asdf",
        "org_id": "123456",
        "email": "hello@czgenepi.org",
        "name": "Name Goes Here",
    }
    group = group_factory(auth0_org_id=userinfo["org_id"])
    async_session.add(group)
    await async_session.commit()

    auth0_apiclient.get_org_user_roles.side_effect = [["admin"]]  # type: ignore
    auth0_oauth.authorize_access_token.side_effect = [{"userinfo": userinfo}]  # type: ignore
    auth0_apiclient.get_user_orgs.side_effect = [[]]  # type: ignore

    res = await http_client.get(
        "/v2/auth/callback",
        allow_redirects=False,
    )
    assert res.status_code == 307
    assert res.is_redirect
    assert f"welcome/{group.id}" in res.headers["Location"]
