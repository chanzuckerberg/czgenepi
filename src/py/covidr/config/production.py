from .config import Config, DatabaseConfig


class ProductionConfig(Config, descriptive_name="prod"):
    ...


class ProductionDatabaseConfig(DatabaseConfig):
    ...
