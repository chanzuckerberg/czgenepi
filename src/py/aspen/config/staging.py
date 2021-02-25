import logging
import uuid

from aspen import aws

from .config import Config, flaskproperty

logger = logging.getLogger(__name__)


class StagingConfig(Config, descriptive_name="staging"):
    @flaskproperty
    def DEBUG(self) -> bool:
        return True

    @flaskproperty
    def SECRET_KEY(self) -> str:
        return uuid.uuid4().hex

    @property
    def AUTH0_CALLBACK_URL(self) -> str:
        eb_env_name = aws.elasticbeanstalk.get_environment_suffix()
        logger.info(f"DETECTED EB_ENV as {eb_env_name}")
        return (
            f"http://aspen-{eb_env_name}.{aws.region()}.elasticbeanstalk.com/callback"
        )

    @property
    def DATABASE_URI(self) -> str:
        return "postgresql://user_rw:password_rw@localhost:5432/aspen_db"
