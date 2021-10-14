from aspen.api.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

def test_healthcheck():
    response = client.get("/v2/health")
    assert response.status_code == 200
    assert response.json() == {"healthy": True}
