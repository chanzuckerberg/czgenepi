import random
import string
from dataclasses import dataclass
from functools import partial
from typing import AsyncGenerator
from unittest.mock import create_autospec, MagicMock

import pytest
from fastapi import Depends, FastAPI, Request
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.api.authn import get_auth0_apiclient, get_auth_user, get_cookie_userid
from aspen.api.deps import get_db
from aspen.api.error import http_exceptions as ex
from aspen.api.main import get_app
from aspen.auth.auth0_management import Auth0Client
from aspen.database import connection as aspen_connection
from aspen.database import schema
from aspen.database.connection import init_async_db
from aspen.database.models import Role, User

USERNAME = "user_rw"
PASSWORD = "password_rw"
INITIAL_DATABASE = "postgres"

pytestmark = pytest.mark.anyio


@dataclass
class AsyncPostgresDatabase:
    database_name: str
    port: int

    def as_uri(self) -> str:
        return f"postgresql+asyncpg://{USERNAME}:{PASSWORD}@database:{self.port}/{self.database_name}"


@pytest.fixture()
async def async_db() -> AsyncGenerator[AsyncPostgresDatabase, None]:
    """Creates a postgres test database named a random string with username/password user_rw/password_rw, yields it, and then drops it."""

    # create admin sql connection to create test database
    admin_uri = "postgresql+asyncpg://postgres:password_postgres@database:5432/aspen_db"
    # set isolation level to allow admin to create db
    admin_sql_interface = aspen_connection.init_async_db(
        admin_uri, isolation_level="AUTOCOMMIT"
    )
    admin_session = admin_sql_interface.make_session()

    # create random database name (for running tests in parallel)
    letters = string.ascii_lowercase
    database_name = "".join(random.choice(letters) for i in range(10))

    await admin_session.execute(f"create database {database_name}")
    await admin_session.execute(
        f"grant all privileges on database {database_name} to {USERNAME}"
    )

    # Install extensions we use to the test database.
    ext_query = await admin_session.execute("SELECT extname FROM pg_extension")
    extensions = [row["extname"] for row in ext_query]
    test_admin_uri = (
        f"postgresql+asyncpg://postgres:password_postgres@database:5432/{database_name}"
    )
    test_admin_interface = aspen_connection.init_async_db(test_admin_uri)
    test_admin_session = test_admin_interface.make_session()
    for extension in extensions:
        await test_admin_session.execute(
            f"CREATE EXTENSION IF NOT EXISTS {extension} WITH SCHEMA public"
        )
    await test_admin_session.commit()  # type: ignore
    await test_admin_session.close()  # type: ignore

    postgres_test_db = AsyncPostgresDatabase(database_name=database_name, port=5432)

    yield postgres_test_db

    await admin_session.execute(f"drop database {database_name} with (force)")
    await admin_session.close()  # type: ignore


@pytest.fixture()
async def async_sqlalchemy_interface(
    async_db: AsyncPostgresDatabase,
) -> AsyncGenerator[aspen_connection.SqlAlchemyInterface, None]:
    """initialize schema and yield interface"""
    test_db_interface = aspen_connection.init_async_db(async_db.as_uri())
    await schema.async_create_tables_and_schema(test_db_interface)

    # Insert any core level data we're going to need for tests.
    session = test_db_interface.make_session()
    roles = [Role(name="admin"), Role(name="viewer"), Role(name="member")]
    session.add_all(roles)
    await session.commit()  # type: ignore
    await session.close()  # type: ignore

    connection = await test_db_interface.engine.connect()  # type: ignore
    try:
        yield test_db_interface
    finally:
        await connection.close()


@pytest.fixture()
async def async_session(
    async_sqlalchemy_interface: aspen_connection.SqlAlchemyInterface,
) -> AsyncGenerator[AsyncSession, None]:
    session = async_sqlalchemy_interface.make_session()
    try:
        yield session
    finally:
        await session.close()  # type: ignore


async def override_get_db(
    async_db: AsyncPostgresDatabase,
) -> AsyncGenerator[AsyncSession, None]:
    db = init_async_db(async_db.as_uri())
    session = db.make_session()
    try:
        yield session
    finally:
        await session.close()  # type: ignore


async def override_get_cookie_userid(
    request: Request, session: AsyncSession = Depends(get_db)
) -> User:
    return request.headers.get("user_id")


@pytest.fixture()
async def auth0_apiclient() -> MagicMock:
    return create_autospec(Auth0Client)


@pytest.fixture()
async def api(
    async_db: AsyncPostgresDatabase,
    auth0_apiclient: MagicMock,
) -> FastAPI:
    api = get_app()
    api.dependency_overrides[get_db] = partial(override_get_db, async_db)
    api.dependency_overrides[get_cookie_userid] = override_get_cookie_userid
    api.dependency_overrides[get_auth0_apiclient] = lambda: auth0_apiclient
    return api


@pytest.fixture(scope="function")
async def http_client(api: FastAPI) -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(app=api, base_url="http://test") as client:
        yield client
