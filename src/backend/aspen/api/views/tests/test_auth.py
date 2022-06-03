import pytest
import sqlalchemy as sa
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from aspen.api.views.auth import create_user_if_not_exists
from aspen.database.models import User
from aspen.test_infra.models.usergroup import group_factory, user_factory

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


async def start_new_transaction(session: AsyncSession):
    await session.commit()
    await session.close()
    session.begin()


async def test_create_new_user_if_not_exists(
    async_session: AsyncSession,
    http_client: AsyncClient,
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
    await start_new_transaction(async_session)
    await create_user_if_not_exists(async_session, userinfo)
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


async def test_dont_create_new_user_if_exists(
    async_session: AsyncSession,
    http_client: AsyncClient,
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
    user = user_factory(auth0_user_id=userinfo["sub"], group=group)
    async_session.add(user)
    await start_new_transaction(async_session)
    await create_user_if_not_exists(async_session, userinfo)
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
