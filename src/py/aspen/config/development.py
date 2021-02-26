import uuid
from functools import lru_cache

from aspen.config import config
from aspen.database.connection import init_db, SqlAlchemyInterface


class DevelopmentConfig(config.Config, descriptive_name="dev"):
    @config.flaskproperty
    def DEBUG(self) -> bool:
        return True

    @config.flaskproperty
    def SECRET_KEY(self) -> str:
        return uuid.uuid4().hex

    @property
    def AUTH0_CALLBACK_URL(self) -> str:
        return "http://localhost:3000/callback"

    @property
    def DATABASE_URI(self) -> str:
        return "postgresql://user_rw:password_rw@localhost:5432/aspen_db"

    @lru_cache()
    def _DATABASE_INTERFACE(self) -> SqlAlchemyInterface:
        return init_db(self.DATABASE_URI)

    @property
    def DATABASE_INTERFACE(self) -> SqlAlchemyInterface:
        return self._DATABASE_INTERFACE()
