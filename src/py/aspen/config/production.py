import uuid

from .config import Config, flaskproperty


class ProductionConfig(Config, descriptive_name="prod"):
    @flaskproperty
    def SECRET_KEY(self) -> str:
        return uuid.uuid4().hex

    @property
    def AUTH0_CALLBACK_URL(self) -> str:
        # TODO: this needs a realistic value.
        return ""
