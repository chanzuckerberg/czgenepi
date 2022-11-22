from unittest.mock import create_autospec, MagicMock

import pytest

from aspen.test_infra.aws import mock_s3_resource  # noqa: F401
from aspen.test_infra.postgres import postgres_database  # noqa: F401
from aspen.test_infra.sqlalchemy import session, sqlalchemy_interface  # noqa: F401
from aspen.util.split import SplitClient


@pytest.fixture()
async def split_client() -> MagicMock:
    return create_autospec(SplitClient)
