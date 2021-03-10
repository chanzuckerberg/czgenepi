import contextlib
import socket
import subprocess
import time
from dataclasses import dataclass
from typing import Generator
from uuid import uuid4

import pytest

from aspen.database import connection as aspen_connection
from aspen.database import schema

USERNAME = "user_rw"
PASSWORD = "password_rw"
INITIAL_DATABASE = "postgres"


@dataclass
class PostgresInstance:
    container_id: str
    port: int


@dataclass
class PostgresDatabase(PostgresInstance):
    database_name: str

    def as_uri(self):
        return f"postgresql://{USERNAME}:{PASSWORD}@localhost:{self.port}/{self.database_name}"


@pytest.fixture(scope="session")
def unused_tcp_port():
    with contextlib.closing(socket.socket()) as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


@pytest.fixture(scope="session")
def postgres_instance(
    unused_tcp_port, timeout_s=30.0
) -> Generator[PostgresInstance, None, None]:
    """Starts a postgres instance with username/password cliadb/cliadb.  Returns a tuple
    consisting of the container id, and the port the postgres instance can be reached
    at."""
    process = subprocess.run(
        [
            "docker",
            "create",
            "-p",
            f"{unused_tcp_port}:5432",
            "-e",
            f"POSTGRES_USER={USERNAME}",
            "-e",
            f"POSTGRES_PASSWORD={PASSWORD}",
            "-e",
            f"POSTGRES_DB={INITIAL_DATABASE}",
            "czbiohub/covidhub-postgres:13.1-alpine",
        ],
        stdout=subprocess.PIPE,
        check=True,
    )
    container_id = process.stdout.decode("utf-8").strip()

    subprocess.check_call(["docker", "start", container_id])

    # Once the docker container has started, it actually starts postgres twice -- once
    # to do some initialization, and once to actually start it up for use.
    #
    # To ensure that we wait until the database is truly ready, we wait for the output
    # indicating that the docker container init is complete (see
    # postgres/docker-entrypoint.sh in this repository for where this string is
    # outputted).  Then we wait for the pg_isready script says the database is ready.
    start = time.time()
    while time.time() < start + timeout_s:
        process = subprocess.run(
            [
                "docker",
                "logs",
                f"{container_id}",
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        if (
            process.returncode == 0
            and process.stdout.decode("utf-8").find(
                "PostgreSQL init process complete; ready for start up."
            )
            != -1
        ):
            break
        time.sleep(0.2)
    else:
        raise RuntimeError("docker init didn't finish.")

    while time.time() < start + timeout_s:
        process = subprocess.run(
            [
                "docker",
                "exec",
                f"{container_id}",
                "pg_isready",
                "-p",
                "5432",
                "-U",
                USERNAME,
                "-t",
                "0",
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        if process.returncode == 0:
            break
        time.sleep(0.2)
    else:
        raise RuntimeError("DB didn't start up.")

    # create the user_ro user.  we don't use this in tests, but the schema creation code
    # will muck around with this user's permissions.
    subprocess.check_call(
        [
            "docker",
            "exec",
            f"{container_id}",
            "psql",
            "-p",
            "5432",
            "-U",
            USERNAME,
            INITIAL_DATABASE,
            "-c",
            "CREATE USER user_ro",
        ],
    )

    yield PostgresInstance(container_id, unused_tcp_port)

    subprocess.check_call(["docker", "stop", container_id])
    subprocess.check_call(["docker", "rm", container_id])


@pytest.fixture()
def postgres_database(postgres_instance) -> Generator[PostgresDatabase, None, None]:
    """Starts a postgres database.  Returns a tuple consisting of the container id, the
    port the postgres instance can be reached at, and the name of the database."""

    safe_uuid = str(uuid4()).replace("-", "_")
    db_name = f"db_{safe_uuid}"
    subprocess.check_call(
        [
            "docker",
            "exec",
            f"{postgres_instance.container_id}",
            "psql",
            "-p",
            "5432",
            "-U",
            USERNAME,
            INITIAL_DATABASE,
            "-c",
            f"CREATE DATABASE {db_name}",
        ],
    )

    yield PostgresDatabase(
        postgres_instance.container_id, postgres_instance.port, db_name
    )


@pytest.fixture()
def postgres_database_with_schema(
    postgres_database,
) -> Generator[PostgresDatabase, None, None]:
    db = aspen_connection.init_db(postgres_database.as_uri())
    schema.create_tables_and_schema(db)
    yield postgres_database
