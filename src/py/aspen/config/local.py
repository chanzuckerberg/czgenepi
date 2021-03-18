import uuid
import os

from aspen.config import config


# Docker-compose environment config
class LocalConfig(config.Config, descriptive_name="local"):
    @config.flaskproperty
    def DEBUG(self) -> bool:
        return True

    @config.flaskproperty
    def SECRET_KEY(self) -> str:
        if os.getenv("FLASK_SECRET_KEY"):
            return os.getenv("FLASK_SECRET_KEY")
        return uuid.uuid4().hex

    @property
    def AUTH0_CALLBACK_URL(self) -> str:
        return "http://localhost:3000/callback"

    @property
    def DATABASE_URI(self) -> str:
        return "postgresql://user_rw:password_rw@database:5432/aspen_db"
