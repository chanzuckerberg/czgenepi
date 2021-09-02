import os

import boto3
import pytest
from moto import mock_s3


@pytest.fixture(scope="session")
def mock_s3_resource():
    with mock_s3():
        backup_boto_url = os.environ.get("BOTO_ENDPOINT_URL")
        if backup_boto_url:
            del os.environ["BOTO_ENDPOINT_URL"]
        s3_resource = boto3.resource("s3")
        yield s3_resource
    if backup_boto_url:
        os.environ["BOTO_ENDPOINT_URL"] = backup_boto_url
