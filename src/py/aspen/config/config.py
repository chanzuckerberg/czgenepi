from __future__ import annotations

import os
from collections import MutableMapping
from typing import Type

from dotenv import find_dotenv, load_dotenv


class Config:
    _subclasses: MutableMapping[str, Type[Config]] = dict()

    def __init_subclass__(cls: Type[Config], descriptive_name: str, *args, **kwargs):
        # the type: ignore on the next line is due to
        # https://github.com/python/mypy/issues/4660
        super().__init_subclass__(*args, **kwargs)  # type: ignore
        Config._subclasses[descriptive_name] = cls

    @classmethod
    def by_descriptive_name(cls, descriptive_name: str) -> Config:
        return Config._subclasses[descriptive_name]()

    @property
    def DEBUG(self):
        return False

    @property
    def SECRET_KEY(self):
        return os.environ.get("SECRET_KEY")

    @property
    def TESTING(self):
        return False

    @property
    def DATABASE_CONFIG(self):
        raise NotImplementedError()

    @property
    def AUTH0_CONFIG(self):
        return Auth0Config()


class Auth0Config:
    def __init__(self):
        ENV_FILE = find_dotenv()
        if ENV_FILE:
            load_dotenv(ENV_FILE)

    @property
    def AUTH0_CLIENT_ID(self):
        return os.environ.get("AUTH0_CLIENT_ID")

    @property
    def AUTH0_CALLBACK_URL(self):
        return os.environ.get("AUTH0_CALLBACK_URL")

    @property
    def AUTH0_CLIENT_SECRET(self):
        return os.environ.get("AUTH0_CLIENT_SECRET")

    @property
    def AUTH0_DOMAIN(self):
        return os.environ.get("AUTH0_DOMAIN")

    @property
    def AUTH0_BASE_URL(self):
        return f"https://{self.AUTH0_DOMAIN}"

    @property
    def ACCESS_TOKEN_URL(self):
        return f"{self.AUTH0_BASE_URL}/oauth/token"

    @property
    def AUTHORIZE_URL(self):
        return f"{self.AUTH0_BASE_URL}/authorize"

    @property
    def CLIENT_KWARGS(self):
        return {
            "scope": "openid profile email",
        }


class DatabaseConfig:
    @property
    def URI(self):
        raise NotImplementedError()

    @property
    def READONLY_URI(self):
        raise NotImplementedError()
