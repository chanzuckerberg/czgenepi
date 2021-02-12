from __future__ import annotations

import json
import os
from collections import MutableMapping
from functools import lru_cache
from typing import Type

import boto3
from botocore.exceptions import ClientError


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
    @property  # type: ignore
    @lru_cache()
    def AWS_SECRET(self):

        secret_name = os.environ.get("SECRET_NAME")
        region_name = os.environ.get("AWS_REGION")

        session = boto3.session.Session()
        client = session.client(service_name="secretsmanager", region_name=region_name)

        try:
            get_secret_value_response = client.get_secret_value(SecretId=secret_name)
        except ClientError as e:
            raise e
        else:
            secret = get_secret_value_response["SecretString"]
            return json.loads(secret)

    @property
    def AUTH0_CLIENT_ID(self):
        return self.AWS_SECRET["AUTH0_CLIENT_ID"]

    @property
    def AUTH0_CALLBACK_URL(self):
        return self.AWS_SECRET["AUTH0_CALLBACK_URL"]

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
