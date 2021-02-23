import uuid
from functools import lru_cache

from ..database.connection import init_db, SqlAlchemyInterface
from .config import Auth0Config, Config, DatabaseConfig


class DevelopmentConfig(Config, descriptive_name="dev"):
    @property
    def DEBUG(self):
        return True

    @property
    def SECRET_KEY(self):
        return uuid.uuid4().hex

    @property
    def DATABASE_CONFIG(self):
        return DevelopmentDatabaseConfig()

    @property
    def AUTH0_CONFIG(self):
        return DevAuth0Config


class DevelopmentDatabaseConfig(DatabaseConfig):
    @property
    def URI(self):
        return "postgresql://user_rw:password_rw@localhost:5432/aspen_db"

    @property
    def SEND_FILE_MAX_AGE_DEFAULT(self):
        """Ensures that latest static assets are read during frontend dev work."""
        return 0

    @lru_cache()
    def _INTERFACE(self) -> SqlAlchemyInterface:
        return init_db(self.URI)

    @property
    def INTERFACE(self):
        return self._INTERFACE()


class DevAuth0Config(Auth0Config):
    @property
    def AUTH0_CALLBACK_URL(self):
        return "http://localhost:3000/callback"
