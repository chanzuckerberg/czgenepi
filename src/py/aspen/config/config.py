from __future__ import annotations

import abc
import json
import os
from collections import MutableMapping
from functools import lru_cache
from typing import Any, Mapping, Type

from botocore.exceptions import ClientError

from aspen import aws
from aspen.database.connection import SqlAlchemyInterface


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

    ####################################################################################
    # secondary config objects.
    @property
    @abc.abstractmethod
    def _AWS_SECRET(self) -> Mapping[str, Any]:
        raise NotImplementedError()

    @property
    @abc.abstractmethod
    def DATABASE_CONFIG(self) -> DatabaseConfig:
        raise NotImplementedError()

    ####################################################################################
    # flask properties
    @property
    def DEBUG(self) -> bool:
        return False

    @property
    @abc.abstractmethod
    def SECRET_KEY(self) -> str:
        raise NotImplementedError()

    @property
    def TESTING(self) -> bool:
        return False

    ####################################################################################
    # auth0 properties
    @property
    def AUTH0_CLIENT_ID(self) -> str:
        return self._AWS_SECRET["AUTH0_CLIENT_ID"]

    @property
    def AUTH0_CALLBACK_URL(self) -> str:
        raise NotImplementedError()

    @property
    def AUTH0_CLIENT_SECRET(self) -> str:
        return self._AWS_SECRET["AUTH0_CLIENT_SECRET"]

    @property
    def AUTH0_DOMAIN(self) -> str:
        return self._AWS_SECRET["AUTH0_DOMAIN"]

    @property
    def AUTH0_BASE_URL(self) -> str:
        return f"https://{self.AUTH0_DOMAIN}"

    @property
    def AUTH0_ACCESS_TOKEN_URL(self) -> str:
        return f"{self.AUTH0_BASE_URL}/oauth/token"

    @property
    def AUTH0_AUTHORIZE_URL(self) -> str:
        return f"{self.AUTH0_BASE_URL}/authorize"

    @property
    def AUTH0_CLIENT_KWARGS(self) -> Mapping[str, Any]:
        return {
            "scope": "openid profile email",
        }


class SecretsConfig:
    """This is to hold configuration fetched from AWS secrets."""

    # this extra level of indirection
    # (Auth0Config.AWS_SECRET -> Auth0Config._AWS_SECRET()) is because of
    # https://github.com/python/mypy/issues/1362
    @lru_cache()
    def _AWS_SECRET(self) -> Mapping[str, Any]:
        session = aws.session()

        secret_name = os.environ.get("AUTH0_CONFIG_SECRET_NAME", "aspen-config")
        client = session.client(service_name="secretsmanager")

        try:
            get_secret_value_response = client.get_secret_value(SecretId=secret_name)
        except ClientError as e:
            raise e
        else:
            secret = get_secret_value_response["SecretString"]
            return json.loads(secret)

    @property
    def AWS_SECRET(self) -> Mapping[str, Any]:
        return self._AWS_SECRET()


class DatabaseConfig:
    """This is for the database config.  Since not all the properties are defined in all
    implementations, it must be a separate configuration object."""

    @property
    # TODO: This should be an abstract method as well.
    def URI(self) -> str:
        raise NotImplementedError()

    @property
    def READONLY_URI(self) -> str:
        raise NotImplementedError()

    @property
    # TODO: This should be an abstract method as well.
    def INTERFACE(self) -> SqlAlchemyInterface:
        raise NotImplementedError()
