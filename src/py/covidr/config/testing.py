from .config import Config


class TestingConfig(Config, descriptive_name="test"):
    @property
    def TESTING(self):
        return True
