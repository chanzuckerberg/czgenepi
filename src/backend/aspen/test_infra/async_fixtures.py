import random
import string
from dataclasses import dataclass
from sqlalchemy.orm.session import Session
from typing import Generator
from aspen.database import schema
from aspen.test_infra.postgres import AsyncPostgresDatabase

import pytest

from aspen.database import connection as aspen_connection

USERNAME = "user_rw"
PASSWORD = "password_rw"
INITIAL_DATABASE = "postgres"

pytestmark = pytest.mark.anyio

@dataclass
class AsyncPostgresDatabase:
    database_name: str
    port: int

    def as_uri(self):
        return f"postgresql+asyncpg://{USERNAME}:{PASSWORD}@database:{self.port}/{self.database_name}"


@pytest.fixture()
async def async_postgres_database() -> Generator[AsyncPostgresDatabase, None, None]:
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

    postgres_test_db = AsyncPostgresDatabase(database_name=database_name, port=5432)

    yield postgres_test_db

    await admin_session.execute(f"drop database {database_name} with (force)")


@pytest.fixture()
async def async_sqlalchemy_interface(
    async_postgres_database: AsyncPostgresDatabase,
) -> Generator[aspen_connection.SqlAlchemyInterface, None, None]:
    """initialize schema and yield interface"""
    test_db_interface = aspen_connection.init_async_db(async_postgres_database.as_uri())
    await schema.async_create_tables_and_schema(test_db_interface)
    connection = await test_db_interface.engine.connect()
    yield test_db_interface
    await connection.close()


@pytest.fixture()
async def async_session(
    async_sqlalchemy_interface: aspen_connection.SqlAlchemyInterface,
) -> Generator[Session, None, None]:
    session = async_sqlalchemy_interface.make_session()
    yield session
    await session.close()
