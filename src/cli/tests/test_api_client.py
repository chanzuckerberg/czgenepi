import pytest
import mock
from .. import aspencli


def test_api_client(requests_mock):
    token_handler_mock = mock.Mock()
    requests_mock.get(
        "http://nothing.local/foo/bar", text='{"hello":"world"}', status_code=200
    )

    client = aspencli.ApiClient("http://nothing.local", token_handler_mock)
    resp = client.get("/foo/bar")

    assert resp.status_code == 200
    assert resp.json()["hello"] == "world"
    token_handler_mock.get_id_token.assert_called_once()
