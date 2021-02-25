import logging
import uuid
from typing import Any, Mapping

from aspen import aws

from .config import Config, DatabaseConfig, SecretsConfig

logger = logging.getLogger(__name__)


class StagingConfig(Config, descriptive_name="staging"):
    def __init__(self):
        self.secretsconfig = SecretsConfig()

    @property
    def _AWS_SECRET(self) -> Mapping[str, Any]:
        return self.secretsconfig.AWS_SECRET

    @property
    def DATABASE_CONFIG(self) -> DatabaseConfig:
        return StagingDatabaseConfig()

    @property
    def DEBUG(self) -> bool:
        return True

    @property
    def SECRET_KEY(self) -> str:
        return uuid.uuid4().hex

    @property
    def AUTH0_CALLBACK_URL(self) -> str:
        eb_env_name = aws.elasticbeanstalk.get_environment_suffix()
        logger.info(f"DETECTED EB_ENV as {eb_env_name}")
        return (
            f"http://aspen-{eb_env_name}.{aws.region()}.elasticbeanstalk.com/callback"
        )


class StagingDatabaseConfig(DatabaseConfig):
    @property
    def URI(self) -> str:
        return "postgresql://user_rw:password_rw@localhost:5432/aspen_db"
