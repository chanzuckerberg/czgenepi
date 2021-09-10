import os

import boto3
import pytest


@pytest.fixture(scope="session")
def mock_s3_resource():
    # NOTE - this is using localstack instead of moto! Beware that state can persist between tests.
    s3 = boto3.resource(
        "s3",
        endpoint_url=os.getenv("BOTO_ENDPOINT_URL") or None,
        config=boto3.session.Config(signature_version="s3v4"),
    )
    yield s3
