from .config import Config, DatabaseConfig


class TestingConfig(Config, descriptive_name="test"):
    @property
    def TESTING(self):
        return True

    @property
    def DATABASE_CONFIG(self):
        return TestingDatabaseConfig()


class TestingDatabaseConfig(DatabaseConfig):
    ...
