from typing import Generator

import pytest
from sqlalchemy.orm.session import Session

from aspen.database import connection as aspen_connection


@pytest.fixture()
def sqlalchemy_interface(
    postgres_database_with_schema,
) -> Generator[aspen_connection.SqlAlchemyInterface, None, None]:
    connection = postgres_database_with_schema.engine.connect()

    yield postgres_database_with_schema

    connection.close()


@pytest.fixture()
def session(sqlalchemy_interface) -> Generator[Session, None, None]:
    session = sqlalchemy_interface.make_session()

    yield session

    session.close()
