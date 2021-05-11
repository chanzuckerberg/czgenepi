import os

from aspen.config import config


class ProductionConfig(config.Config):
    @config.flaskproperty
    def DEBUG(self) -> bool:
        return False

    @config.flaskproperty
    def SESSION_COOKIE_SECURE(self) -> bool:
        return True

    @property
    def AUTH0_CALLBACK_URL(self) -> str:
        return f"{os.getenv('API_URL', '')}/callback"
