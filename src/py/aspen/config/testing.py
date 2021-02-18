from functools import lru_cache

from ..database.connection import init_db, SqlAlchemyInterface
from .config import Config, DatabaseConfig


class TestingConfig(Config, descriptive_name="test"):
    @property
    def TESTING(self):
        return True

    @property
    def DATABASE_CONFIG(self):
        return TestingDatabaseConfig()


class TestingDatabaseConfig(DatabaseConfig):
    def __init__(self):
        self._uri = None

    @property
    def URI(self):
        return self._uri

    @URI.setter
    def URI(self, uri):
        self._uri = uri

    @lru_cache()
    def _INTERFACE(self) -> SqlAlchemyInterface:
        return init_db(self.URI)

    @property
    def INTERFACE(self):
        return self._INTERFACE()
