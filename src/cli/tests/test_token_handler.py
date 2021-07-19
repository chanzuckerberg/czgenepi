import pytest
import mock
from unittest.mock import patch
import json
import time
from .. import aspencli


def test_creds_initializer():
    th = aspencli.TokenHandler("test_client_id", "https://auth.local", None)
    assert th.domain == "auth.local"


def test_creds_loader():
    keyring_mock = mock.MagicMock()
    keyring_mock.get_password.return_value = ""

    th = aspencli.TokenHandler("", "", keyring_mock)
    assert th.load_creds() == None

    creds = {"id_token": "testing", "expires_at": 9999999999999}
    keyring_mock.get_password.return_value = json.dumps(creds)
    assert th.load_creds() == creds


def test_creds_writer(requests_mock):
    with patch.object(
        aspencli.TokenHandler, "decode_token", return_value={"exp": 12345}
    ) as mocked_decode:
        keyring_mock = mock.MagicMock()
        th = aspencli.TokenHandler("", "https://auth.local", keyring_mock)
        creds = {"id_token": "testing"}
        keyring_mock.get_password.return_value = json.dumps(creds)
        th.write_creds(creds)
    assert creds["expires_at"] == 12345
    keyring_mock.set_password.assert_called_once_with(
        "aspencli", "devicetoken-auth.local", json.dumps(creds)
    )
