from .config import Config

class DevelopmentConfig(Config):
    DEBUG = True
    SEND_FILE_MAX_AGE_DEFAULT = 0
