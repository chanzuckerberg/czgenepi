from aspen.config import config


# Docker-compose environment config
class DockerComposeConfig(config.Config):
    @config.flaskproperty
    def DEBUG(self) -> bool:
        return True

    @config.flaskproperty
    def SESSION_COOKIE_SECURE(self) -> bool:
        return True

    @config.flaskproperty
    def SESSION_COOKIE_HTTPONLY(self) -> bool:
        return True

    @config.flaskproperty
    def SESSION_COOKIE_SAMESITE(self) -> str:
        return "Lax"

    @property
    def AUTH0_CALLBACK_URL(self) -> str:
        return "http://localhost:3000/callback"
