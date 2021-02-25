import uuid
from functools import lru_cache

from ..database.connection import init_db, SqlAlchemyInterface
from .config import Config, flaskproperty


class DevelopmentConfig(Config, descriptive_name="dev"):
    @flaskproperty
    def DEBUG(self) -> bool:
        return True

    @flaskproperty
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
