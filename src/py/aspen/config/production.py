import uuid
from typing import Any, Mapping

from .config import Config, DatabaseConfig, SecretsConfig


class ProductionConfig(Config, descriptive_name="prod"):
    def __init__(self):
        self.secretsconfig = SecretsConfig()

    @property
    def _AWS_SECRET(self) -> Mapping[str, Any]:
        return self.secretsconfig.AWS_SECRET

    @property
    def DATABASE_CONFIG(self) -> DatabaseConfig:
        return ProductionDatabaseConfig()

    @property
    def SECRET_KEY(self) -> str:
        return uuid.uuid4().hex

    @property
    def AUTH0_CALLBACK_URL(self) -> str:
        # TODO: this needs a realistic value.
        return ""


class ProductionDatabaseConfig(DatabaseConfig):
    ...
