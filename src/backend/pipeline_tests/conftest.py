from aspen.test_infra.aws import mock_s3_resource  # noqa: F401
from aspen.test_infra.postgres import postgres_database  # noqa: F401
from aspen.test_infra.sqlalchemy import session, sqlalchemy_interface  # noqa: F401
import pytest

import click
import sqlalchemy as sa
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.sql.expression import literal_column

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import Accession, AccessionType, GisaidMetadata, Sample


@pytest.fixture
def session():
    config = Config()
    interface: SqlAlchemyInterface = init_db(get_db_uri(config))
    with session_scope(interface) as session:
        yield session