import pytest

from fastapi.testclient import TestClient
from aspen.config.testing import TestingConfig
from aspen.api.main import app


@pytest.fixture(scope="function")
def fastapi_app(postgres_database):
    yield app


@pytest.fixture(scope="function")
def fastapi_client(fastapi_app):
    client = TestClient(app)
    return client
