import pytest

from httpx import AsyncClient
from aspen.config.testing import TestingConfig
from aspen.api.main import app

pytestmark = pytest.mark.anyio

@pytest.fixture(scope="function")
def fastapi_app(postgres_database):
    yield app


@pytest.fixture(scope="function")
async def fastapi_client(fastapi_app):
    client = AsyncClient(app=app)
    return client
