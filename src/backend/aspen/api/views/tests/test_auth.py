from typing import Optional, Set, Tuple

import pytest
import sqlalchemy as sa
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from aspen.api.views.auth import create_user_if_not_exists
from aspen.auth.auth0_management import Auth0Client
from aspen.auth.role_manager import RoleManager
from aspen.database.models import User, UserRole
from aspen.test_infra.models.usergroup import (
    group_factory,
    user_factory,
    userrole_factory,
)

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


async def test_create_new_admin_user_if_not_exists(
    async_session: AsyncSession,
    http_client: AsyncClient,
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
    auth0_apiclient.get_org_user_roles.side_effect = [["admin"]]  # type: ignore
    await start_new_transaction(async_session)
    await create_user_if_not_exists(async_session, auth0_apiclient, userinfo)
    await start_new_transaction(async_session)
    user = (
        (
            await async_session.execute(
                sa.select(User)  # type: ignore
                .options(joinedload(User.group, innerjoin=True))  # type: ignore
                .filter(User.auth0_user_id == userinfo["sub"])  # type: ignore
            )
        )
        .scalars()
        .one()
    )
    assert user.group_id == group.id
    assert user.email == userinfo["email"]
    assert user.group_admin is True


async def test_create_new_user_if_not_exists(
    async_session: AsyncSession,
    http_client: AsyncClient,
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
    await create_user_if_not_exists(async_session, auth0_apiclient, userinfo)
    await start_new_transaction(async_session)
    user = (
        (
            await async_session.execute(
                sa.select(User)  # type: ignore
                .options(joinedload(User.group, innerjoin=True))  # type: ignore
                .filter(User.auth0_user_id == userinfo["sub"])  # type: ignore
            )
        )
        .scalars()
        .one()
    )
    assert user.group_id == group.id
    assert user.email == userinfo["email"]
    assert user.group_admin is False


async def test_dont_create_new_user_if_exists(
    async_session: AsyncSession,
    http_client: AsyncClient,
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
    await create_user_if_not_exists(async_session, auth0_apiclient, userinfo)
    original_user_id = user.id
    async_session.expire_all()
    await start_new_transaction(async_session)
    db_user = (
        (
            await async_session.execute(
                sa.select(User)  # type: ignore
                .options(joinedload(User.group, innerjoin=True))  # type: ignore
                .filter(User.auth0_user_id == userinfo["sub"])  # type: ignore
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
    auth0_apiclient.get_org_user_roles.side_effect = [["member"], ["member"], ["admin"]]  # type: ignore
    auth0_apiclient.get_user_orgs.side_effect = [[{"id": group1.auth0_org_id}, {"id": group3.auth0_org_id}]]  # type: ignore
    await start_new_transaction(async_session)
    user_obj: Optional[User] = await create_user_if_not_exists(
        async_session, auth0_apiclient, userinfo
    )
    assert user_obj is not None
    await RoleManager.sync_user_roles(async_session, auth0_apiclient, user_obj)
    assert user_obj.email == userinfo["email"]

    await start_new_transaction(async_session)
    user = (
        (
            await async_session.execute(
                sa.select(User)  # type: ignore
                .options(joinedload(User.group, innerjoin=True))  # type: ignore
                .filter(User.auth0_user_id == userinfo["sub"])  # type: ignore
            )
        )
        .scalars()
        .one()
    )
    assert user.group_id == group1.id
    assert user.email == userinfo["email"]
    assert user.group_admin is False


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
    matrix = [
        # Add a role where there was nothing
        [users[0], [], [(groups[1], "admin")]],
        # leave one role intact and add another
        [
            users[1],
            [(groups[2], "member")],
            [(groups[2], "member"), (groups[3], "admin")],
        ],
        # wipe everything out
        [
            users[2],
            [(groups[3], "member"), (groups[4], "member"), (groups[5], "member")],
            [],
        ],
        # add and remove 2 of each
        [
            users[3],
            [(groups[6], "member"), (groups[7], "member"), (groups[8], "member")],
            [(groups[6], "member"), (groups[9], "admin"), (groups[10], "member")],
        ],
    ]

    # Back to our regularly scheduled testing programming
    for user, starting_roles, final_roles in matrix:
        for group, role in starting_roles:
            async_session.add(
                await RoleManager.generate_user_role(async_session, user, group, role)
            )
        orgs_response = [{"id": group.auth0_org_id} for group, _ in final_roles]
        members_responses = [[role] for _, role in final_roles]
        auth0_apiclient.get_org_user_roles.side_effect = members_responses
        auth0_apiclient.get_user_orgs.side_effect = [orgs_response]
        await RoleManager.sync_user_roles(async_session, auth0_apiclient, user)
        await start_new_transaction(async_session)

        expected_roles = set(
            [(group.auth0_org_id, role) for group, role in final_roles]
        )
        await check_roles(async_session, user.auth0_user_id, expected_roles)
