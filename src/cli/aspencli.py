#!/usr/bin/env python3
import click
import requests
import json
import time
import os.path
from urllib.parse import urlparse
import webbrowser
import keyring
from auth0.v3.authentication.token_verifier import (
    TokenVerifier,
    AsymmetricSignatureVerifier,
)


class TokenHandler:
    def __init__(self, client_id, auth_url, keyring, verify=True):
        parsed_url = urlparse(auth_url)
        self.auth_url = auth_url
        self.domain = parsed_url.netloc
        self.client_id = client_id
        self.keyring = keyring
        self.verify = verify

    def get_id_token(self):
        creds = self.load_creds()
        if not creds:
            self.device_login()
            creds = self.load_creds()
        return creds["id_token"]

    def decode_token(self, token):
        jwks_url = f"{self.auth_url}/.well-known/jwks.json"
        issuer = f"{self.auth_url}/"
        sv = AsymmetricSignatureVerifier(jwks_url)  # Reusable instance
        payload = sv.verify_signature(token)
        return payload

    def load_creds(self):
        creds = self.keyring.get_password("aspencli", f"devicetoken-{self.domain}")
        if not creds:
            return None
        creds = json.loads(creds)
        # Assume this is token expired if it expires in the next 60s
        if creds["expires_at"] > (int(time.time()) - 60):
            return creds
        return None

    def write_creds(self, creds):
        payload = self.decode_token(creds["id_token"])
        creds["expires_at"] = payload["exp"]
        self.keyring.set_password(
            "aspencli", f"devicetoken-{self.domain}", json.dumps(creds)
        )

    def device_login(self):
        headers = {"content-type": "application/x-www-form-urlencoded"}
        json_headers = {"content-type": "application/json"}
        payload = {"client_id": self.client_id, "scope": "openid profile email"}
        auth_resp = requests.post(
            f"{self.auth_url}/oauth/device/code",
            headers=headers,
            data=payload,
            verify=self.verify,
        )
        auth_resp.raise_for_status()
        device_info = auth_resp.json()
        print(
            "Opening this link in a browser:\n"
            f"    {device_info['verification_uri_complete']}\n"
            "Click confirm to continue"
        )
        webbrowser.open_new_tab(device_info['verification_uri_complete'])
        poll_payload = {
            "client_id": self.client_id,
            "device_code": device_info["device_code"],
            "audience": self.client_id,
            "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
        }
        while True:
            res = requests.post(
                f"{self.auth_url}/oauth/token",
                headers=headers,
                data=poll_payload,
                verify=self.verify,
            )
            if res.status_code == 403:
                print("waiting...")
                time.sleep(device_info["interval"])
                continue
            if res.status_code != 200:
                raise Exception(f"Invalid response: {res.text}")
            self.write_creds(res.json())
            return


class ApiClient:
    def __init__(self, url, token_handler):
        self.url = url
        self.token_handler = token_handler

    def get_headers(self):
        access_token = self.token_handler.get_id_token()
        headers = {"Authorization": f"Bearer {access_token}"}
        if os.getenv("OAUTH2_PROXY_COOKIE"):
            headers["Cookie"] = f"_oauth2_proxy={os.getenv('OAUTH2_PROXY_COOKIE')}"
        return headers

    def get(self, path, **kwargs):
        headers = self.get_headers()
        url = f"{self.url}{path}"
        return requests.get(url, headers=headers, allow_redirects=False, **kwargs)

    def post(self, path, **kwargs):
        headers = self.get_headers()
        url = f"{self.url}{path}"
        return requests.post(url, headers=headers, allow_redirects=False, **kwargs)


class CliConfig:
    api_urls = {
        "staging": "https://api.staging.genepi.czi.technology",
        "prod": "https://api.aspen.cziscience.com",
        "rdev": "https://{stack}-backend.dev.genepi.czi.technology",
        "local": "http://backend.genepinet.local:3000",
    }
    oauth_config = {
        "prod": {
            "auth_url": "https://covidtracker.us.auth0.com",
            "client_id": "PAl0i5pE2rfNS184du02LpAHK5lDhcE2",
            "verify": True,
        },
        "default": {
            "auth_url": "https://covidtracker-staging.auth0.com",
            "client_id": "YIKBzdeiwgSoMZ88Fo1F65Ebd16Rj5mP",
            "verify": True,
        },
        "local": {
            "auth_url": "https://oidc.genepinet.local:8443",
            "client_id": "local-client-id",
            "verify": False,
        },
    }

    def __init__(self, env, api=None, stack=None):
        if not api:
            api = self.api_urls.get(env)
        if stack:
            api = api.format(stack=stack)
        self.api = api
        self.env = env

    def get_api_client(self):
        auth_config = self.oauth_config["default"]
        if self.env in self.oauth_config:
            auth_config = self.oauth_config[self.env]

        token_handler = TokenHandler(
            client_id=auth_config["client_id"],
            auth_url=auth_config["auth_url"],
            keyring=keyring.get_keyring(),
            verify=auth_config["verify"],
        )
        api_client = ApiClient(self.api, token_handler)
        return api_client


@click.group()
@click.option(
    "--env",
    default="local",
    type=click.Choice(["local", "rdev", "staging", "prod"], case_sensitive=False),
    help="Aspen API to call",
)
@click.option(
    "--api",
    help="Aspen API endpoint to use - this overrides the default value chosen by the --env flag",
)
@click.option(
    "--stack",
    help="Aspen rdev stack to query",
)
@click.pass_context
def cli(ctx, env, api, stack):
    ctx.ensure_object(dict)
    config = CliConfig(env, api, stack)
    ctx.obj["config"] = config
    ctx.obj["api_client"] = config.get_api_client()


@cli.group()
def userinfo():
    pass


@userinfo.command(name="get")
@click.pass_context
def get_userinfo(ctx):
    api_client = ctx.obj["api_client"]
    resp = api_client.get("/api/usergroup")
    print(resp.text)


@cli.group()
def samples():
    pass


@samples.command(name="download")
@click.argument("sample_ids", nargs=-1)
@click.pass_context
def download_samples(ctx, sample_ids):
    api_client = ctx.obj["api_client"]
    payload = {"requested_sequences": {"sample_ids": sample_ids}}
    resp = api_client.post("/api/sequences", json=payload)
    print(resp.headers)
    print(resp.text)


if __name__ == "__main__":
    cli()
