import logging
import uuid

from aspen import aws

from .config import Auth0Config, Config, DatabaseConfig

logger = logging.getLogger(__name__)


class StagingConfig(Config, descriptive_name="staging"):
    @property
    def DEBUG(self):
        return True

    @property
    def SECRET_KEY(self):
        return uuid.uuid4().hex

    @property
    def DATABASE_CONFIG(self):
        return StagingDatabaseConfig()

    @property
    def AUTH0_CONFIG(self):
        return StagingAuth0Config()


class StagingDatabaseConfig(DatabaseConfig):
    @property
    def URI(self):
        return "postgresql://user_rw:password_rw@localhost:5432/aspen_db"

    @property
    def SEND_FILE_MAX_AGE_DEFAULT(self):
        """Ensures that latest static assets are read during frontend dev work."""
        return 0


class StagingAuth0Config(Auth0Config):
    @property
    def AUTH0_CALLBACK_URL(self):
        eb_env_name = aws.elasticbeanstalk.get_environment_suffix()
        logger.info(f"DETECTED EB_ENV as {eb_env_name}")
        return (
            f"http://aspen-{eb_env_name}.{aws.region()}.elasticbeanstalk.com/callback"
        )
