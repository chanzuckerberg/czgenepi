import uuid
from functools import lru_cache
from typing import Any, Mapping

from ..database.connection import init_db, SqlAlchemyInterface
from .config import Config, DatabaseConfig, flaskproperty, SecretsConfig


class DevelopmentConfig(Config, descriptive_name="dev"):
    def __init__(self):
        self.secretsconfig = SecretsConfig()

    @property
    def DATABASE_CONFIG(self) -> DatabaseConfig:
        return DevelopmentDatabaseConfig()

    @property
    def _AWS_SECRET(self) -> Mapping[str, Any]:
        return self.secretsconfig.AWS_SECRET

    @flaskproperty
    def DEBUG(self) -> bool:
        return True

    @flaskproperty
    def SECRET_KEY(self) -> str:
        return uuid.uuid4().hex

    @property
    def AUTH0_CALLBACK_URL(self) -> str:
        return "http://localhost:3000/callback"


class DevelopmentDatabaseConfig(DatabaseConfig):
    @property
    def URI(self) -> str:
        return "postgresql://user_rw:password_rw@localhost:5432/aspen_db"

    @lru_cache()
    def _INTERFACE(self) -> SqlAlchemyInterface:
        return init_db(self.URI)

    @property
    def INTERFACE(self) -> SqlAlchemyInterface:
        return self._INTERFACE()
