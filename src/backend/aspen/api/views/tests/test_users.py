from aspen.api.main import get_app
from httpx import AsyncClient
from aspen.api.auth import setup_userinfo
from aspen.api.deps import set_db, get_db
import functools
import pytest
from fastapi import Request
from aspen.api.auth import get_auth_user
from aspen.test_infra.models.usergroup import group_factory, user_factory
from aspen.database.connection import init_async_db
import pytest
from contextvars import ContextVar
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

session_context_var: ContextVar[Optional[AsyncSession]] = ContextVar(
    "_session", default=None
)

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio

async def override_get_auth_user(request: Request):
    found_auth_user = await setup_userinfo(request.headers.get("user_id"))
    print(f"auth user: {request.headers.get('user_id')}")
    session = get_db()
    import sqlalchemy as sa
    from aspen.database.models import Group, User
    users = await session.execute(sa.select(User))  # type: ignore
    for user in users.scalars():
        print(f"DBUser: {user.auth0_user_id}")
    if not found_auth_user:
        raise Exception("invalid user")
    request.state.auth_user = found_auth_user

def override_get_db():
    """Fetch db session from the context var"""
    session = session_context_var.get()
    if session is None:
        raise Exception("Missing session")
    return session

async def override_set_db(async_postgres_database):
    print(async_postgres_database.as_uri())
    db = init_async_db(async_postgres_database.as_uri())
    session = db.make_session()
    token = session_context_var.set(session)
    try:
        yield
    finally:
        await session.close()
        session_context_var.reset(token)


@pytest.fixture()
async def fastapi_app(async_postgres_database):
    app = get_app()
    app.dependency_overrides[get_auth_user] = override_get_auth_user
    app.dependency_overrides[set_db] = functools.partial(override_set_db, async_postgres_database)
    app.dependency_overrides[get_db] = override_get_db
    return app


@pytest.fixture(scope="function")
async def fastapi_client(fastapi_app):
    client = AsyncClient(app=fastapi_app)
    return client

async def test_users_me(fastapi_client, async_session):
    group = group_factory()
    user = user_factory(group)
    async_session.add(group)
    await async_session.commit()

    response = await fastapi_client.get("/v2/users/me", headers={"user_id": user.auth0_user_id})
    assert response.status_code == 200
    assert response.json() == {"healthy": True}
