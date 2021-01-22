from .config import Config


class DevelopmentConfig(Config, descriptive_name="dev"):
    @property
    def DEBUG(self):
        return True

    @property
    def DATABASE_URI(self):
        # TODO: fetch this from AWS secrets?
        return "postgresql://user_rw:password_rw@localhost:5432/covidr_db"

    # ensures that latest static assets are read during frontend dev work
    @property
    def SEND_FILE_MAX_AGE_DEFAULT(self):
        return 0
