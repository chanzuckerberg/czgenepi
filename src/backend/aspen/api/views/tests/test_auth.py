import pytest
import sqlalchemy as sa
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from typing import Set, Tuple, Optional

from aspen.api.views.auth import create_user_if_not_exists
from aspen.auth.auth0_management import Auth0Client
from aspen.database.models import User, UserRole, Role
from aspen.test_infra.models.usergroup import group_factory, userrole_factory

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


async def start_new_transaction(session: AsyncSession):
    await session.commit()
    await session.close()
    session.begin()

async def check_roles(async_session: AsyncSession, auth0_user_id: str, expected_roles: Set[Tuple[str, str]]):
    db_roles = (
        (
            await async_session.execute(
                sa.select(User)  # type: ignore
                .options(joinedload(User.user_roles, innerjoin=True).options(  # type: ignore
                         joinedload(UserRole.group, innerjoin=True),  # type: ignore
                         joinedload(UserRole.role, innerjoin=True))  # type: ignore
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
    expected_roles = {(group.auth0_org_id, "admin")}
    await check_roles(async_session, userinfo["sub"], expected_roles)


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
    expected_roles = {(group.auth0_org_id, "member")}
    await check_roles(async_session, userinfo["sub"], expected_roles)


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
    expected_roles = {(group.auth0_org_id, "member")}
    await check_roles(async_session, userinfo["sub"], expected_roles)

async def test_create_new_user_and_sync_roles(
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
    user_obj: Optional[User] = await create_user_if_not_exists(async_session, auth0_apiclient, userinfo)
    assert user_obj is not None
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
    assert user.group_id == group.id
    assert user.email == userinfo["email"]
    assert user.group_admin is False