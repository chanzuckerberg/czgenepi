import pytest

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)


@pytest.fixture
def session():
    config = Config()
    interface: SqlAlchemyInterface = init_db(get_db_uri(config))
    with session_scope(interface) as session:
        yield session
