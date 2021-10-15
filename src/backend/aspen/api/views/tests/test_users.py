from aspen.api.main import get_app
from functools import partial
from httpx import AsyncClient
from aspen.api.auth import setup_userinfo
from aspen.api.settings import get_settings
from aspen.api.deps import get_db
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
from fastapi import Depends
import sqlalchemy as sa
from aspen.database.models import User

session_context_var: ContextVar[Optional[AsyncSession]] = ContextVar(
    "_session", default=None
)

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio

async def override_get_db(async_postgres_database):
    db = init_async_db(async_postgres_database.as_uri())
    session = db.make_session()
    token = session_context_var.set(session)
    try:
        yield session
    finally:
        await session.close()
        session_context_var.reset(token)


async def override_get_auth_user(request: Request, session=Depends(get_db)):
    found_auth_user = await setup_userinfo(session, request.headers.get("user_id"))
    users = await session.execute(sa.select(User))  # type: ignore
    if not found_auth_user:
        raise Exception("invalid user")
    request.state.auth_user = found_auth_user

@pytest.fixture()
async def fastapi_app(async_postgres_database):
    app = get_app()
    app.dependency_overrides[get_db] = partial(override_get_db, async_postgres_database)
    app.dependency_overrides[get_auth_user] = override_get_auth_user
    return app


@pytest.fixture(scope="function")
async def fastapi_client(fastapi_app):
    client = AsyncClient(app=fastapi_app, base_url="http://test")
    return client

async def test_users_me(fastapi_client, async_session):
    group = group_factory()
    user = user_factory(group)
    async_session.add(group)
    await async_session.commit()

    response = await fastapi_client.get("/v2/users/me", headers={"user_id": user.auth0_user_id})
    print(response.text)
    assert response.status_code == 200
    assert response.json() == {"agreed_to_tos": True}
