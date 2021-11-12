#!/usr/bin/env python3
import click
import csv
import requests
import json
import time
import os.path
from urllib.parse import urlparse, quote
import webbrowser
import keyring
from auth0.v3.authentication.token_verifier import (
    TokenVerifier,
    JwksFetcher,
    AsymmetricSignatureVerifier,
)

class InsecureJwksFetcher(JwksFetcher):
    def _fetch_jwks(self, force=False):
        has_expired = self._cache_date + self._cache_ttl < time.time()

        if not force and not has_expired:
            # Return from cache
            self._cache_is_fresh = False
            return self._cache_value

        # Invalidate cache and fetch fresh data
        self._cache_value = {}
        response = requests.get(self._jwks_url, verify=False)

        if response.ok:
            # Update cache
            jwks = response.json()
            self._cache_value = self._parse_jwks(jwks)
            self._cache_is_fresh = True
            self._cache_date = time.time()
        return self._cache_value

class TokenHandler:
    def __init__(self, client_id, auth_url, keyring, oauth_api_config, verify=True):
        parsed_url = urlparse(auth_url)
        self.auth_url = auth_url
        self.domain = parsed_url.netloc
        self.client_id = client_id
        self.keyring = keyring
        self.verify = verify
        self.waiting_status_code = oauth_api_config["waiting_status_code"]
        self.poll_url = oauth_api_config["poll_url"].format(auth_url=self.auth_url)
        self.device_auth_url = oauth_api_config["device_auth_url"].format(auth_url=self.auth_url)
        self.jwks_url = oauth_api_config["jwks_url"].format(auth_url=self.auth_url)
        self.client_secret = oauth_api_config["client_secret"]
        if self.verify:
            self.sv = AsymmetricSignatureVerifier(self.jwks_url)
        else:
            self.sv = AsymmetricSignatureVerifier(self.jwks_url)
            self.sv._fetcher = InsecureJwksFetcher(self.jwks_url)

    def get_id_token(self):
        creds = self.load_creds()
        if not creds:
            self.device_login()
            creds = self.load_creds()
        return creds["id_token"]

    def decode_token(self, token):
        issuer = f"{self.auth_url}/"
        payload = self.sv.verify_signature(token)
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
        if self.client_secret:
            payload["client_secret"] = self.client_secret
        auth_resp = requests.post(
            self.device_auth_url,
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
        if self.client_secret:
            poll_payload["client_secret"] = self.client_secret
        while True:
            res = requests.post(
                self.poll_url,
                headers=headers,
                data=poll_payload,
                verify=self.verify,
            )
            if res.status_code == self.waiting_status_code:
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

    def delete(self, path, **kwargs):
        headers = self.get_headers()
        url = f"{self.url}{path}"
        return requests.delete(url, headers=headers, allow_redirects=False, **kwargs)

    def post(self, path, **kwargs):
        headers = self.get_headers()
        url = f"{self.url}{path}"
        return requests.post(url, headers=headers, allow_redirects=False, **kwargs)


class CliConfig:
    api_urls = {
        "staging": "https://api.staging.genepi.czi.technology",
        "prod": "https://api.aspen.cziscience.com",
        "rdev": "https://{stack}-backend.dev.genepi.czi.technology",
        "local": "http://backend.genepinet.localdev:3000",
    }
    default_oauth_api = {
        "device_auth_url": "{auth_url}/oauth/device/code",
        "poll_url": "{auth_url}/oauth/token",
        "waiting_status_code": 403,
        "client_secret": None,
        "jwks_url": "{auth_url}/.well-known/jwks.json",
    }
    oauth_config = {
        "prod": {
            "auth_url": "https://covidtracker.us.auth0.com",
            "client_id": "PAl0i5pE2rfNS184du02LpAHK5lDhcE2",
            "verify": True,
            "oauth_api_config": default_oauth_api,
        },
        "default": {
            "auth_url": "https://covidtracker-staging.auth0.com",
            "client_id": "YIKBzdeiwgSoMZ88Fo1F65Ebd16Rj5mP",
            "verify": True,
            "oauth_api_config": default_oauth_api,
        },
        "local": {
            "auth_url": "https://oidc.genepinet.localdev:8443",
            "client_id": "local-client-id",
            "verify": False,
            "oauth_api_config": {
                "waiting_status_code": 400,
                "device_auth_url": "{auth_url}/connect/deviceauthorization",
                "poll_url": "{auth_url}/connect/token",
                "client_secret": "local-client-secret",
                "jwks_url": "{auth_url}/.well-known/openid-configuration/jwks",
            }
        }
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
            oauth_api_config=auth_config["oauth_api_config"],
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
def usher():
    pass


@usher.command(name="get-link")
@click.argument("sample_ids", nargs=-1)
@click.pass_context
def get_link(ctx, sample_ids):
    api_client = ctx.obj["api_client"]
    payload = {"samples": sample_ids}
    resp = api_client.post("/api/sequences/getfastaurl", json=payload)
    print(resp.text)
    resp_info = resp.json()
    s3_url = resp_info["url"]
    print(f"https://genome.ucsc.edu/cgi-bin/hgPhyloPlace?db=wuhCor1&remoteFile={quote(s3_url)}")



@cli.group()
def user():
    pass


@user.command(name="me")
@click.pass_context
def me(ctx):
    api_client = ctx.obj["api_client"]
    resp = api_client.get("/v2/users/me")
    print(resp.text)


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
def phylo_trees():
    pass

@phylo_trees.command(name="get-sample-ids")
@click.argument("tree_id")
@click.pass_context
def get_tree_sample_ids(ctx, tree_id):
    api_client = ctx.obj["api_client"]
    resp = api_client.get(f"/api/phylo_tree/sample_ids/{tree_id}")
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


@samples.command(name="delete")
@click.argument("sample_ids", nargs=-1)
@click.pass_context
def delete_samples(ctx, sample_ids):
    api_client = ctx.obj["api_client"]
    for sample in sample_ids:
        resp = api_client.delete(f"/v2/samples/{sample}")
        print(resp.headers)
        print(resp.text)


@samples.command(name="update_public_ids")
@click.option("group_id", "--group-id", type=int, required=True)
@click.option("is_gisaid_isl", "--is-gisaid-isl", is_flag=True)
# csv file should have headers private_identifier and public_identifier
@click.option(
    "private_to_public_id_mapping_fh",
    "--private-to-public-id-mapping",
    type=click.File("r"),
    required=True,
)
@click.pass_context
def update_public_ids(ctx, group_id, is_gisaid_isl, private_to_public_id_mapping_fh):
    api_client = ctx.obj["api_client"]

    csvreader = csv.DictReader(private_to_public_id_mapping_fh)
    private_to_public = {
        row["private_identifier"].strip(): row["public_identifier"].strip()
        for row in csvreader
    }

    payload = {
        "group_id": group_id,
        "id_mapping": private_to_public
    }

    # check if public_identifiers to be updated are gisaid isl accession numbers
    if is_gisaid_isl:
        payload["public_ids_are_gisaid_isl"] = True

    resp = api_client.post("/api/samples/update/publicids", json=payload)
    print(resp.headers)
    print(resp.text)


@cli.group()
def phylo_runs():
    pass


@phylo_runs.command(name="create")
@click.option("-n","--name", required=True, type=str)
@click.option("-t","--type", "tree_type", required=True, type=click.Choice(["OVERVIEW", "TARGETED", "NON_CONTEXTUALIZED"], case_sensitive=False))
@click.option("-h", "--show-headers", is_flag=True)
@click.argument("sample_ids", nargs=-1)
@click.pass_context
def start_phylo_run_v2(ctx, name, tree_type, sample_ids, show_headers):
    api_client = ctx.obj["api_client"]
    payload = { "name": name, "tree_type": tree_type, "samples": sample_ids }
    resp = api_client.post("/v2/phylo_runs/", json=payload)
    if show_headers:
        print(resp.headers)
    print(resp.text)
    print(resp)


@phylo_runs.command(name="delete")
@click.argument("run_ids", nargs=-1)
@click.pass_context
def delete_runs(ctx, run_ids):
    api_client = ctx.obj["api_client"]
    for run_id in run_ids:
        resp = api_client.delete(f"/v2/phylo_runs/{run_id}")
        print(resp.headers)
        print(resp.text)


if __name__ == "__main__":
    cli()
