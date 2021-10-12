import json
import os
from functools import cached_property, lru_cache
from typing import Any, Mapping

from boto3 import Session
from botocore.exceptions import ClientError
from pydantic import BaseSettings


class Settings(BaseSettings):
    """Pydantic Settings object - do not instantiate it directly, please use get_settings() as a dependency where possible"""

    SERVICE_NAME: str = "Aspen"

    DB_DRIVER: str = "postgresql+asyncpg"

    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 0
    DB_ECHO: bool = False
    AWS_REGION: str

    ####################################################################################
    # Stack name
    @cached_property
    def STACK_PREFIX(self) -> str:
        remote_prefix = os.environ.get("REMOTE_DEV_PREFIX")
        deployment_stage = os.environ.get("DEPLOYMENT_STAGE")
        stack_name = remote_prefix if remote_prefix else f"/{deployment_stage}stack"
        return stack_name

    ####################################################################################
    # AWS secrets
    @cached_property
    def AWS_SECRET(self) -> Mapping[str, Any]:
        session = Session(region_name=self.AWS_REGION)

        secret_name = os.environ.get("ASPEN_CONFIG_SECRET_NAME", "aspen-config")
        client = session.client(
            service_name="secretsmanager",
            endpoint_url=os.environ.get("BOTO_ENDPOINT_URL"),
        )

        try:
            get_secret_value_response = client.get_secret_value(SecretId=secret_name)
        except ClientError as e:
            raise e
        else:
            secret = get_secret_value_response["SecretString"]
            return json.loads(secret)

    @cached_property
    def DEBUG(self) -> bool:
        return False

    @cached_property
    def SECRET_KEY(self) -> str:
        return self.AWS_SECRET["FLASK_SECRET"]

    ####################################################################################
    # auth0 properties
    @cached_property
    def AUTH0_CLIENT_ID(self) -> str:
        return self.AWS_SECRET["AUTH0_CLIENT_ID"]

    @cached_property
    def AUTH0_LOGOUT_URL(self) -> str:
        flask_env = os.environ.get("FLASK_ENV")
        if flask_env == "production":
            return f"{self.AUTH0_BASE_URL}/v2/logout"
        else:
            return f"https://{self.AUTH0_DOMAIN}/Account/Logout"

    @cached_property
    def AUTH0_CALLBACK_URL(self) -> str:
        flask_env = os.environ.get("FLASK_ENV")
        if flask_env != "production":
            return "http://backend.genepinet.local:3000/v2/auth/callback"
        api_url = os.environ.get("API_URL")
        if not api_url:
            raise Exception("Missing API_URL in config!")
        return f"{api_url}/v2/auth/callback"

    @cached_property
    def AUTH0_CLIENT_SECRET(self) -> str:
        return self.AWS_SECRET["AUTH0_CLIENT_SECRET"]

    @cached_property
    def AUTH0_MANAGEMENT_CLIENT_ID(self) -> str:
        return self.AWS_SECRET["AUTH0_MANAGEMENT_CLIENT_ID"]

    @cached_property
    def AUTH0_MANAGEMENT_CLIENT_SECRET(self) -> str:
        return self.AWS_SECRET["AUTH0_MANAGEMENT_CLIENT_SECRET"]

    @cached_property
    def AUTH0_DOMAIN(self) -> str:
        return self.AWS_SECRET["AUTH0_DOMAIN"]

    @cached_property
    def AUTH0_BASE_URL(self) -> str:
        try:
            return self.AWS_SECRET["AUTH0_BASE_URL"]
        except KeyError:
            return f"https://{self.AUTH0_DOMAIN}"

    @cached_property
    def AUTH0_ACCESS_TOKEN_URL(self) -> str:
        try:
            return self.AWS_SECRET["AUTH0_ACCESS_TOKEN_URL"]
        except KeyError:
            return f"{self.AUTH0_BASE_URL}/oauth/token"

    @cached_property
    def AUTH0_AUTHORIZE_URL(self) -> str:
        try:
            return self.AWS_SECRET["AUTH0_AUTHORIZE_URL"]
        except KeyError:
            return f"{self.AUTH0_BASE_URL}/authorize"

    @cached_property
    def AUTH0_CLIENT_KWARGS(self) -> Mapping[str, Any]:
        try:
            return self.AWS_SECRET["AUTH0_CLIENT_KWARGS"]
        except KeyError:
            return {
                "scope": "openid profile email",
            }

    @cached_property
    def AUTH0_USERINFO_URL(self) -> str:
        try:
            return self.AWS_SECRET["AUTH0_USERINFO_URL"]
        except KeyError:
            return "userinfo"

    ####################################################################################
    # database properties
    @cached_property
    def DB_DSN(self) -> str:
        # Allow db uri to be overridden by env var.
        if os.getenv("DB_DSN"):
            return os.environ["DB_DSN"]
        if os.getenv("DB_URI"):
            return os.environ["DB_URI"]
        username = self.AWS_SECRET["DB_rw_username"]
        password = self.AWS_SECRET["DB_rw_password"]
        instance_address = self.AWS_SECRET["DB_address"]
        db_name = os.getenv("REMOTE_DEV_PREFIX") or "/aspen_db"
        return f"{self.DB_DRIVER}://{username}:{password}@{instance_address}{db_name}"

    @cached_property
    def DATABASE_READONLY_URI(self) -> str:
        raise NotImplementedError()

    ####################################################################################
    # s3 properties
    @cached_property
    def DB_BUCKET(self) -> str:
        return self.AWS_SECRET["S3_db_bucket"]

    @cached_property
    def EXTERNAL_AUSPICE_BUCKET(self) -> str:
        return self.AWS_SECRET["S3_external_auspice_bucket"]

    ####################################################################################
    # sentry properties
    @cached_property
    def SENTRY_URL(self) -> str:
        if os.getenv("SENTRY_URL"):
            return os.environ["SENTRY_URL"]
        try:
            return self.AWS_SECRET["SENTRY_URL"]
        except KeyError:
            return ""

    ####################################################################################
    # SSM Parameter properties
    @lru_cache
    def _AWS_SSM_PARAMETER(self, parameter_suffix) -> Mapping[str, Any]:
        session = Session(region_name=self.AWS_REGION)

        deployment_stage = os.environ.get("DEPLOYMENT_STAGE")
        parameter_name = (
            f"/aspen/{deployment_stage}{self.STACK_PREFIX}/{parameter_suffix}"
        )
        client = session.client(
            service_name="ssm", endpoint_url=os.environ.get("BOTO_ENDPOINT_URL")
        )

        try:
            get_parameter = client.get_parameter(Name=parameter_name)
        except ClientError as e:
            raise e
        else:
            parameter = get_parameter["Parameter"]["Value"]
            return json.loads(parameter)

    @cached_property
    def AWS_NEXTSTRAIN_SFN_PARAMETER(self) -> Mapping[str, Any]:
        return self._AWS_SSM_PARAMETER("nextstrain-ondemand-sfn")

    ####################################################################################
    # SFN runtime input properties
    @cached_property
    def NEXTSTRAIN_DOCKER_IMAGE_ID(self) -> str:
        return self.AWS_NEXTSTRAIN_SFN_PARAMETER["Input"]["Run"]["docker_image_id"]

    ####################################################################################
    # SFN batch config properties
    @cached_property
    def NEXTSTRAIN_OUTPUT_PREFIX(self) -> str:
        return self.AWS_NEXTSTRAIN_SFN_PARAMETER["OutputPrefix"]

    @cached_property
    def RUN_WDL_URI(self) -> str:
        return self.AWS_NEXTSTRAIN_SFN_PARAMETER["RUN_WDL_URI"]

    @cached_property
    def NEXTSTRAIN_EC2_MEMORY(self) -> str:
        return self.AWS_NEXTSTRAIN_SFN_PARAMETER["RunEC2Memory"]

    @cached_property
    def NEXTSTRAIN_EC2_VCPU(self) -> str:
        return self.AWS_NEXTSTRAIN_SFN_PARAMETER["RunEC2Vcpu"]

    @cached_property
    def NEXTSTRAIN_SPOT_MEMORY(self) -> str:
        return self.AWS_NEXTSTRAIN_SFN_PARAMETER["RunSPOTMemory"]

    @cached_property
    def NEXTSTRAIN_SPOT_VCPU(self) -> str:
        return self.AWS_NEXTSTRAIN_SFN_PARAMETER["RunSPOTVcpu"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        keep_untouched = (
            cached_property,
        )  # https://github.com/samuelcolvin/pydantic/issues/1241


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    return settings
