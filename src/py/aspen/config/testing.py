import uuid
from functools import lru_cache

from aspen.config import config
from aspen.database.connection import init_db, SqlAlchemyInterface


class TestingConfig(config.Config, descriptive_name="test"):
    def __init__(self, db_uri):
        self.db_uri = db_uri

    @config.flaskproperty
    def TESTING(self):
        return True

    @config.flaskproperty
    def SECRET_KEY(self):
        return uuid.uuid4().hex

    @property
    def AUTH0_CALLBACK_URL(self):
        return None

    @property
    def DATABASE_URI(self):
        return self.db_uri

    @lru_cache()
    def _DATABASE_INTERFACE(self) -> SqlAlchemyInterface:
        return init_db(self.DATABASE_URI)

    @property
    def DATABASE_INTERFACE(self):
        return self._DATABASE_INTERFACE()
