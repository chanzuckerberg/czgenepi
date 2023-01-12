import requests


def test_backend_serves_requests():
    
    backend_request = requests.get("http://backend.genepinet.localdev:3000/v2/openapi.json")
    assert backend_request.status_code == 200
