import urllib.request


def test_backend_serves_requests():
    for env in [
        "http://backend.genepinet.localdev:3000",
        "https://api.staging.czgenepi.org",
        "https://api.czgenepi.org",
    ]:
        request = urllib.request.urlopen(f"{env}/v2/health")
        assert request.status == 200
