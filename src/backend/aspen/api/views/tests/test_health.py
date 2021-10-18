import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def test_healthcheck(http_client: AsyncClient) -> None:
    response = await http_client.get("/v2/health")
    assert response.status_code == 200
    assert response.json() == {"healthy": True}
