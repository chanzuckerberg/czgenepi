import json
import os
from functools import cached_property
from typing import Any, Dict

from boto3 import Session
from botocore.exceptions import ClientError
from pydantic import BaseSettings


def aws_secret_settings(settings) -> Dict[str, Any]:
    session = Session(region_name=os.environ["AWS_REGION"])
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
    response: Dict = {}
    secrets = json.loads(secret)
    keys = settings.__config__.aws_secret_keys
    response = {key: secrets[key] for key in keys if secrets.get(key)}
    remap_keys = settings.__config__.aws_secrets_remap
    response.update(
        {val: secrets[key] for key, val in remap_keys.items() if secrets.get(key)}
    )
    return response


def aws_ssm_settings(settings) -> Dict[str, Any]:
    session = Session(region_name=os.environ["AWS_REGION"])

    dev_prefix = os.environ.get("REMOTE_DEV_PREFIX")
    deployment_stage = os.environ.get("DEPLOYMENT_STAGE")
    stack_prefix = dev_prefix if dev_prefix else f"/{deployment_stage}stack"

    parameters = settings.__config__.aws_ssm_params

    client = session.client(
        service_name="ssm", endpoint_url=os.environ.get("BOTO_ENDPOINT_URL")
    )

    response: Dict[str, Any] = {}
    for param, key_name in parameters.items():
        parameter_path = f"/aspen/{deployment_stage}{stack_prefix}/{param}"
        try:
            get_parameter = client.get_parameter(Name=parameter_path)
        except ClientError as e:
            raise e
        else:
            param_value = get_parameter["Parameter"]["Value"]
        response[key_name] = json.loads(param_value)
    return response


class Settings(BaseSettings):
    """Pydantic Settings object - do not instantiate it directly, please use get_settings() as a dependency where possible"""

    # Hardcoded vars"
    SERVICE_NAME: str = "Aspen"
    DB_DRIVER: str = "postgresql+asyncpg"
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 0
    DB_ECHO: bool = False
    DEBUG: bool = True

    # Env vars usually read from env vars
    AWS_REGION: str
    FLASK_ENV: str
    API_URL: str
    REMOTE_DEV_PREFIX: str = ""
    DEPLOYMENT_STAGE: str = ""

    # Env vars usually pulled from AWS Secrets Manager
    SENTRY_BACKEND_DSN: str = ""
    EXTERNAL_AUSPICE_BUCKET: str
    DB_BUCKET: str = ""
    DB_rw_username: str
    DB_rw_password: str
    DB_address: str
    AUTH0_USERINFO_URL: str = "userinfo"
    FLASK_SECRET: str
    AUTH0_CLIENT_ID: str
    AUTH0_CLIENT_SECRET: str
    AUTH0_MANAGEMENT_CLIENT_ID: str = ""
    AUTH0_MANAGEMENT_CLIENT_SECRET: str = ""
    AUTH0_DOMAIN: str
    AUTH0_CLIENT_KWARGS: Dict[str, Any] = {
        "scope": "openid profile email",
    }

    # These are same-name'd keys in an AWS secret, so they get remapped when
    # we load the secrets, and then we use getter methods to handle special cases.
    SECRET_AUTH0_AUTHORIZE_URL: str
    SECRET_AUTH0_BASE_URL: str
    SECRET_AUTH0_ACCESS_TOKEN_URL: str

    # Env vars usually pulled from AWS SSM Parameters
    AWS_NEXTSTRAIN_SFN_PARAMETERS: Dict

    ####################################################################################
    # Stack name
    @cached_property
    def AUTH0_LOGOUT_URL(self) -> str:
        flask_env = self.FLASK_ENV
        if flask_env == "production":
            return f"{self.AUTH0_BASE_URL}/v2/logout"
        else:
            return f"https://{self.AUTH0_DOMAIN}/Account/Logout"

    @cached_property
    def AUTH0_CALLBACK_URL(self) -> str:
        api_url = self.API_URL
        return f"{api_url}/v2/auth/callback"

    @cached_property
    def AUTH0_BASE_URL(self) -> str:
        try:
            return self.SECRET_AUTH0_BASE_URL
        except KeyError:
            return f"https://{self.AUTH0_DOMAIN}"

    @cached_property
    def AUTH0_ACCESS_TOKEN_URL(self) -> str:
        try:
            return self.SECRET_AUTH0_ACCESS_TOKEN_URL
        except KeyError:
            return f"{self.AUTH0_BASE_URL}/oauth/token"

    @cached_property
    def AUTH0_AUTHORIZE_URL(self) -> str:
        try:
            return self.SECRET_AUTH0_AUTHORIZE_URL
        except KeyError:
            return f"{self.AUTH0_BASE_URL}/authorize"

    ####################################################################################
    # database properties
    @cached_property
    def DB_DSN(self) -> str:
        # Allow db uri to be overridden by env var.
        if os.getenv("DB_DSN"):
            return os.environ["DB_DSN"]
        if os.getenv("DB_URI"):
            return os.environ["DB_URI"]
        username = self.DB_rw_username
        password = self.DB_rw_password
        instance_address = self.DB_address
        db_name = self.REMOTE_DEV_PREFIX or "/aspen_db"
        return f"{self.DB_DRIVER}://{username}:{password}@{instance_address}{db_name}"

    @cached_property
    def DATABASE_READONLY_URI(self) -> str:
        raise NotImplementedError()

    ####################################################################################
    # SFN batch config properties
    @cached_property
    def NEXTSTRAIN_DOCKER_IMAGE_ID(self) -> str:
        return self.AWS_NEXTSTRAIN_SFN_PARAMETERS["Input"]["Run"]["docker_image_id"]

    @cached_property
    def NEXTSTRAIN_OUTPUT_PREFIX(self) -> str:
        return self.AWS_NEXTSTRAIN_SFN_PARAMETERS["OutputPrefix"]

    @cached_property
    def RUN_WDL_URI(self) -> str:
        return self.AWS_NEXTSTRAIN_SFN_PARAMETERS["RUN_WDL_URI"]

    @cached_property
    def NEXTSTRAIN_EC2_MEMORY(self) -> str:
        return self.AWS_NEXTSTRAIN_SFN_PARAMETERS["RunEC2Memory"]

    @cached_property
    def NEXTSTRAIN_EC2_VCPU(self) -> str:
        return self.AWS_NEXTSTRAIN_SFN_PARAMETERS["RunEC2Vcpu"]

    @cached_property
    def NEXTSTRAIN_SPOT_MEMORY(self) -> str:
        return self.AWS_NEXTSTRAIN_SFN_PARAMETERS["RunSPOTMemory"]

    @cached_property
    def NEXTSTRAIN_SPOT_VCPU(self) -> str:
        return self.AWS_NEXTSTRAIN_SFN_PARAMETERS["RunSPOTVcpu"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        keep_untouched = (
            cached_property,
        )  # https://github.com/samuelcolvin/pydantic/issues/1241
        aws_secrets_remap = {
            "S3_db_bucket": "DB_BUCKET",
            "S3_external_auspice_bucket": "EXTERNAL_AUSPICE_BUCKET",
            "AUTH0_BASE_URL": "SECRET_AUTH0_BASE_URL",
            "AUTH0_ACCESS_TOKEN_URL": "SECRET_AUTH0_ACCESS_TOKEN_URL",
            "AUTH0_AUTHORIZE_URL": "SECRET_AUTH0_AUTHORIZE_URL",
        }
        aws_secret_keys = [
            "SENTRY_BACKEND_DSN",
            "DB_rw_username",
            "DB_rw_password",
            "DB_address",
            "AUTH0_USERINFO_URL",
            "FLASK_SECRET",
            "AUTH0_CLIENT_ID",
            "AUTH0_CLIENT_SECRET",
            "AUTH0_MANAGEMENT_CLIENT_ID",
            "AUTH0_MANAGEMENT_CLIENT_SECRET",
            "AUTH0_DOMAIN",
            "AUTH0_CLIENT_KWARGS",
        ]
        aws_ssm_params = {"nextstrain-ondemand-sfn": "AWS_NEXTSTRAIN_SFN_PARAMETERS"}

        @classmethod
        def customise_sources(
            cls,
            init_settings,
            env_settings,
            file_secret_settings,
        ):
            return (
                init_settings,
                env_settings,
                file_secret_settings,
                aws_secret_settings,
                aws_ssm_settings,
            )
