from typing import Generator

import pytest
from sqlalchemy.orm.session import Session

from aspen.database import connection as aspen_connection
from aspen.database import schema
from aspen.test_infra.postgres import PostgresDatabase, AsyncPostgresDatabase


@pytest.fixture()
def sqlalchemy_interface(
    postgres_database: PostgresDatabase,
) -> Generator[aspen_connection.SqlAlchemyInterface, None, None]:
    """initialize schema and yield interface"""
    test_db_interface = aspen_connection.init_db(postgres_database.as_uri())
    schema.create_tables_and_schema(test_db_interface)
    connection = test_db_interface.engine.connect()
    yield test_db_interface
    connection.close()


@pytest.fixture()
def session(
    sqlalchemy_interface: aspen_connection.SqlAlchemyInterface,
) -> Generator[Session, None, None]:
    session = sqlalchemy_interface.make_session()
    yield session
    session.close()

@pytest.fixture()
async def async_sqlalchemy_interface(
    async_postgres_database: AsyncPostgresDatabase,
) -> Generator[aspen_connection.SqlAlchemyInterface, None, None]:
    """initialize schema and yield interface"""
    test_db_interface = aspen_connection.init_async_db(async_postgres_database.as_uri())
    await schema.async_create_tables_and_schema(test_db_interface)
    connection = test_db_interface.engine.connect()
    yield test_db_interface
    connection.close()


@pytest.fixture()
async def async_session(
    async_sqlalchemy_interface: aspen_connection.SqlAlchemyInterface,
) -> Generator[Session, None, None]:
    session = sqlalchemy_interface.make_session()
    yield session
    session.close()
