import contextlib
import socket
import subprocess
import time
from dataclasses import dataclass
from typing import Generator
from uuid import uuid4
import string
import random

import pytest

from aspen.database import connection as aspen_connection
from aspen.database import schema


USERNAME = "user_rw"
PASSWORD = "password_rw"
INITIAL_DATABASE = "postgres"


@dataclass
class PostgresDatabase():
    database_name: str
    port: int

    def as_uri(self):
        return f"postgresql://{USERNAME}:{PASSWORD}@database:{self.port}/{self.database_name}"


@pytest.fixture(scope="function")
def postgres_database():
    """Starts a postgres instance with username/password cliadb/cliadb.  Returns a tuple
    consisting of the container id, and the port the postgres instance can be reached
    at."""
    admin_uri = "postgresql://postgres:password_postgres@database:5432/aspen_db"
    admin_sql_interface = aspen_connection.init_db(admin_uri)

    admin_session = admin_sql_interface.make_session()
    admin_session.connection().connection.set_isolation_level(0)
    letters = string.ascii_lowercase
    DATABASE_NAME = ( ''.join(random.choice(letters) for i in range(10)) )

    # admin_session.execute(f"drop database {DATABASE_NAME}")
    admin_session.execute(f"create database {DATABASE_NAME}")
    admin_session.execute(f"grant all privileges on database {DATABASE_NAME} to {USERNAME}")
    # admin_session.connection().connection.set_isolation_level(1)

    postgres_test_db = PostgresDatabase(database_name=DATABASE_NAME, port=5432)

    yield postgres_test_db

    # admin_session.execute(f"drop database {DATABASE_NAME}")



@pytest.fixture(scope="function")
def postgres_database_with_schema(postgres_database) -> PostgresDatabase:
    test_db = aspen_connection.init_db(postgres_database.as_uri())
    schema.create_tables_and_schema(test_db)
    yield test_db
