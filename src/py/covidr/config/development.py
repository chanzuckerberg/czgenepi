from .config import Config, DatabaseConfig


class DevelopmentConfig(Config, descriptive_name="dev"):
    @property
    def DEBUG(self):
        return True

    @property
    def DATABASE_CONFIG(self):
        return DevelopmentDatabaseConfig()


class DevelopmentDatabaseConfig(DatabaseConfig):
    @property
    def URI(self):
        return "postgresql://user_rw:password_rw@localhost:5432/covidr_db"
