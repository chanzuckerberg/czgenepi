from fastapi.testclient import TestClient

from aspen.api.main import app

client = TestClient(app)


def test_healthcheck() -> None:
    response = client.get("/v2/health")
    assert response.status_code == 200
    assert response.json() == {"healthy": True}
