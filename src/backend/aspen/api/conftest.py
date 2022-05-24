import random
import string
from dataclasses import dataclass
from functools import partial
from typing import AsyncGenerator

import pytest
from fastapi import Depends, FastAPI, Request
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.api.auth import get_auth_user, setup_userinfo
from aspen.api.deps import get_db
from aspen.api.error import http_exceptions as ex
from aspen.api.main import get_app
from aspen.auth.auth0_mock import MockAuth0Client
from aspen.database import connection as aspen_connection
from aspen.database import schema
from aspen.database.connection import init_async_db
from aspen.database.models import User

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


async def override_get_auth_user(
    request: Request, session: AsyncSession = Depends(get_db)
) -> User:
    found_auth_user = await setup_userinfo(session, request.headers.get("user_id"))
    if not found_auth_user:
        raise ex.UnauthorizedException("invalid user")
    request.state.auth_user = found_auth_user
    return found_auth_user


async def override_get_auth0_client(
    request: Request,
    settings: Settings = Depends(get_settings),
) -> Auth0Client:
    client_id: str = settings.AUTH0_MANAGEMENT_CLIENT_ID
    client_secret: str = settings.AUTH0_MANAGEMENT_CLIENT_SECRET
    domain: str = settings.AUTH0_MANAGEMENT_DOMAIN
    auth0_client = MockAuth0Client(client_id, client_secret, domain)
    return auth0_client


@pytest.fixture()
async def api(
    async_db: AsyncPostgresDatabase,
) -> FastAPI:
    api = get_app()
    api.dependency_overrides[get_db] = partial(override_get_db, async_db)
    api.dependency_overrides[get_auth_user] = override_get_auth_user
    api.dependency_overrides[get_auth0_client] = override_get_auth0_client
    return api


@pytest.fixture(scope="function")
async def http_client(api: FastAPI) -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(app=api, base_url="http://test") as client:
        yield client
