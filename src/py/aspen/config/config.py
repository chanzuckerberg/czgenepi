from __future__ import annotations

import json
import os
from collections import MutableMapping
from functools import lru_cache
from typing import Any, Mapping, Type

from botocore.exceptions import ClientError

from aspen import aws


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
        raise NotImplementedError()

    @property
    def TESTING(self):
        return False

    @property
    def DATABASE_CONFIG(self):
        raise NotImplementedError()

    @property
    def AUTH0_CONFIG(self):
        return NotImplementedError()


class Auth0Config:
    # this extra level of indirection
    # (Auth0Config.AWS_SECRET -> Auth0Config._AWS_SECRET()) is because of
    # https://github.com/python/mypy/issues/1362
    @lru_cache()
    def _AWS_SECRET(self) -> Mapping[str, Any]:
        session = aws.session()

        secret_name = os.environ.get("AUTH0_CONFIG_SECRET_NAME", "aspen-auth0")
        client = session.client(service_name="secretsmanager")

        try:
            get_secret_value_response = client.get_secret_value(SecretId=secret_name)
        except ClientError as e:
            raise e
        else:
            secret = get_secret_value_response["SecretString"]
            return json.loads(secret)

    @property
    def AWS_SECRET(self):
        return self._AWS_SECRET()

    @property
    def AUTH0_CLIENT_ID(self):
        return self.AWS_SECRET["AUTH0_CLIENT_ID"]

    @property
    def AUTH0_CALLBACK_URL(self):
        raise NotImplementedError()

    @property
    def AUTH0_CLIENT_SECRET(self):
        return self.AWS_SECRET["AUTH0_CLIENT_SECRET"]

    @property
    def AUTH0_DOMAIN(self):
        return self.AWS_SECRET["AUTH0_DOMAIN"]

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
