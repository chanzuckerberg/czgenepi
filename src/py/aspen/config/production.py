import uuid

from aspen.config import config


class ProductionConfig(config.Config, descriptive_name="prod"):
    @config.flaskproperty
    def SECRET_KEY(self) -> str:
        return uuid.uuid4().hex

    @property
    def AUTH0_CALLBACK_URL(self) -> str:
        # TODO: this needs a realistic value.
        return ""
