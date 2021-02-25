import uuid
from functools import lru_cache
from typing import Any, Mapping

from ..database.connection import init_db, SqlAlchemyInterface
from .config import Config, DatabaseConfig, flaskproperty


class TestingConfig(Config, descriptive_name="test"):
    def __init__(self, db_uri):
        self.db_uri = db_uri

    @property
    def _AWS_SECRET(self) -> Mapping[str, Any]:
        return {
            "AUTH0_DOMAIN": None,
            "AUTH0_CLIENT_ID": None,
            "AUTH0_CLIENT_SECRET": None,
        }

    @property
    def DATABASE_CONFIG(self):
        return TestingDatabaseConfig(self.db_uri)

    @flaskproperty
    def TESTING(self):
        return True

    @flaskproperty
    def SECRET_KEY(self):
        return uuid.uuid4().hex

    @property
    def AUTH0_CALLBACK_URL(self):
        return None


class TestingDatabaseConfig(DatabaseConfig):
    def __init__(self, db_uri):
        self.db_uri = db_uri

    @property
    def URI(self):
        return self.db_uri

    @lru_cache()
    def _INTERFACE(self) -> SqlAlchemyInterface:
        return init_db(self.URI)

    @property
    def INTERFACE(self):
        return self._INTERFACE()
