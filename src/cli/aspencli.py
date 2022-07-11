#!/usr/bin/env python3
import json
import os.path
import time
import webbrowser
from typing import Optional
from urllib.parse import quote, urlparse

import click
import dateparser
import keyring
import requests
from auth0.v3.authentication.token_verifier import (
    AsymmetricSignatureVerifier, JwksFetcher)
from tabulate import tabulate


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
        self.device_auth_url = oauth_api_config["device_auth_url"].format(
            auth_url=self.auth_url
        )
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
        webbrowser.open_new_tab(device_info["verification_uri_complete"])
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
    def __init__(self, url, token_handler, org_id):
        self.url = url
        self.org_id = org_id
        self.token_handler = token_handler

    def get_headers(self):
        access_token = self.token_handler.get_id_token()
        headers = {"Authorization": f"Bearer {access_token}"}
        if os.getenv("OAUTH2_PROXY_COOKIE"):
            headers["Cookie"] = f"_oauth2_proxy={os.getenv('OAUTH2_PROXY_COOKIE')}"
        return headers

    def url_with_org(self, path):
        if self.org_id:
            path = path.replace("/v2/", f"/v2/orgs/{self.org_id}/")
        print(f"path: {path}")
        return path

    def get_with_org(self, path, **kwargs):
        url = self.url_with_org(path)
        return self.get(url, **kwargs)

    def delete_with_org(self, path, **kwargs):
        url = self.url_with_org(path)
        return self.delete(url, **kwargs)

    def put_with_org(self, path, **kwargs):
        url = self.url_with_org(path)
        return self.put(url, **kwargs)

    def post_with_org(self, path, **kwargs):
        url = self.url_with_org(path)
        return self.post(url, **kwargs)

    def get(self, path, **kwargs):
        headers = self.get_headers()
        url = f"{self.url}{path}"
        return requests.get(url, headers=headers, allow_redirects=False, **kwargs)

    def delete(self, path, **kwargs):
        headers = self.get_headers()
        url = f"{self.url}{path}"
        return requests.delete(url, headers=headers, allow_redirects=False, **kwargs)

    def put(self, path, **kwargs):
        headers = self.get_headers()
        url = f"{self.url}{path}"
        return requests.put(url, headers=headers, allow_redirects=False, **kwargs)

    def post(self, path, **kwargs):
        headers = self.get_headers()
        url = f"{self.url}{path}"
        return requests.post(url, headers=headers, allow_redirects=False, **kwargs)


class CliConfig:
    api_urls = {
        "staging": "https://api.staging.czgenepi.org",
        "prod": "https://api.czgenepi.org",
        "rdev": "https://{stack}-backend.dev.czgenepi.org",
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
            },
        },
    }

    def __init__(self, env, api=None, stack=None):
        if not api:
            api = self.api_urls.get(env)
        if stack:
            api = api.format(stack=stack)
        self.api = api
        self.env = env

    def get_api_client(self, org_id):
        auth_config = self.oauth_config["default"]
        self.org_id = org_id
        if self.env in self.oauth_config:
            auth_config = self.oauth_config[self.env]

        token_handler = TokenHandler(
            client_id=auth_config["client_id"],
            auth_url=auth_config["auth_url"],
            keyring=keyring.get_keyring(),
            oauth_api_config=auth_config["oauth_api_config"],
            verify=auth_config["verify"],
        )
        api_client = ApiClient(self.api, token_handler, org_id)
        return api_client


@click.group()
@click.option(
    "--env",
    default="local",
    type=click.Choice(["local", "rdev", "staging", "prod"], case_sensitive=False),
    help="Aspen API to call",
)
@click.option(
    "--org",
    required=False,
    default=lambda: os.environ.get("CZGE_ORG"),
    type=int,
    help="Org context for requests",
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
def cli(ctx, env, org, api, stack):
    ctx.ensure_object(dict)
    config = CliConfig(env, api, stack)
    ctx.obj["config"] = config
    ctx.obj["api_client"] = config.get_api_client(org)


@cli.group()
def usher():
    pass


@usher.command(name="get-link")
@click.argument("sample_ids", nargs=-1)
@click.pass_context
def get_link(ctx, sample_ids):
    api_client = ctx.obj["api_client"]
    payload = {"samples": sample_ids, "downstream_consumer": "USHER"}
    resp = api_client.post("/v2/sequences/getfastaurl", json=payload)
    resp_info = resp.json()
    s3_url = resp_info["url"]
    print(
        f"https://genome.ucsc.edu/cgi-bin/hgPhyloPlace?db=wuhCor1&remoteFile={quote(s3_url)}"
    )


@usher.command(name="get-tree-versions")
@click.pass_context
def get_tree_versions(ctx):
    api_client = ctx.obj["api_client"]
    resp = api_client.get("/v2/usher/tree_versions/")
    print(resp.text)


@cli.group()
def user():
    pass


@user.command(name="me")
@click.pass_context
def me(ctx):
    api_client = ctx.obj["api_client"]
    resp = api_client.get("/v2/users/me")
    print(resp.text)


@user.command(name="update-me")
@click.option(
    "--agreed-to-tos",
    required=True,
    type=bool,
    help="whether the user has agreed to the ToS",
)
@click.option(
    "--ack-policy-version",
    required=True,
    type=str,
    help="YYYY-MM-DD of the policy version the user agreed to",
)
@click.option("--name", required=False, type=str, help="The user's full name.")
@click.pass_context
def update_me(ctx, agreed_to_tos, ack_policy_version, name):
    api_client = ctx.obj["api_client"]
    params = {
        "agreed_to_tos": agreed_to_tos,
        "acknowledged_policy_version": ack_policy_version,
        "name": name,
    }
    resp = api_client.put("/v2/users/me", json=params)
    print(resp.text)


@user.command(name="create")
@click.argument("email")
@click.option("--name", required=True, type=str, help="The user's name.")
@click.option(
    "--group-id",
    required=True,
    type=str,
    help="The id of the group to create the user in.",
)
@click.option(
    "--auth0-user-id",
    required=True,
    type=str,
    help="The auth0 identifier attached to the user's auth0 account.",
)
@click.option("--group-admin", is_flag=True, default=False)
@click.option("--system-admin", is_flag=True, default=False)
@click.pass_context
def create(
    ctx,
    email,
    name,
    group_id,
    auth0_user_id,
    group_admin,
    system_admin,
):
    api_client = ctx.obj["api_client"]
    user = {
        "name": name,
        "email": email,
        "group_id": group_id,
        "group_admin": group_admin,
        "system_admin": system_admin,
        "auth0_user_id": auth0_user_id,
    }
    print(user)
    resp = api_client.post("/v2/users/", json=user)
    print(resp.text)


@cli.group()
def group():
    pass


@group.command(name="create")
@click.option(
    "--name",
    required=True,
    type=str,
    help="The group's name. Must be at least 3 characters.",
)
@click.option(
    "--prefix",
    required=True,
    type=str,
    help="The group's prefix. Must be at least 2 characters, max 20.",
)
@click.option(
    "--tree-location",
    required=True,
    type=int,
    help="The default tree location for the group. Must be an integer corresponding to a location in the database.",
)
@click.option("--address", type=str, help="The group's full address.")
@click.option(
    "--division",
    type=str,
    help="The regional division of the country the group is located in.",
)
@click.option(
    "--location",
    type=str,
    help="The location within a regional division the group is located in.",
)
@click.pass_context
def create_group(
    ctx,
    name: str,
    prefix: str,
    tree_location: int,
    address: Optional[str],
    division: Optional[str],
    location: Optional[str],
):
    api_client = ctx.obj["api_client"]
    group = {
        "name": name,
        "prefix": prefix,
        "default_tree_location_id": tree_location,
        "address": address,
        "division": division,
        "location": location,
    }
    print(group)
    resp = api_client.post("/v2/groups/", json=group)
    print(resp.text)


@group.command(name="get")
@click.argument("group_id")
@click.pass_context
def get_group_info(ctx, group_id):
    api_client = ctx.obj["api_client"]
    resp = api_client.get(f"/v2/groups/{group_id}/")
    print(resp.text)


@group.command(name="members")
@click.argument("group_id")
@click.pass_context
def get_group_members(ctx, group_id):
    api_client = ctx.obj["api_client"]
    resp = api_client.get(f"/v2/groups/{group_id}/members/")
    print(resp.text)


@group.command(name="invites")
@click.argument("group_id")
@click.pass_context
def get_group_invitations(ctx, group_id):
    api_client = ctx.obj["api_client"]
    resp = api_client.get(f"/v2/groups/{group_id}/invitations/")
    print(resp.text)


@group.command(name="invite")
@click.argument("group_id")
@click.argument("email")
@click.option(
    "--role",
    help="Role to invite the user to",
    type=click.Choice(["admin", "member"], case_sensitive=False),
    default="member",
)
@click.pass_context
def invite_group_members(ctx, group_id, email, role):
    api_client = ctx.obj["api_client"]
    body = {
        "role": role,
        "emails": [email],
    }
    resp = api_client.post(f"/v2/groups/{group_id}/invitations/", json=body)
    print(resp.text)


@cli.group()
def userinfo():
    pass


@cli.group()
def phylo_trees():
    pass


@phylo_trees.command(name="download")
@click.argument("tree_id")
@click.option("--public-ids/--private-ids", is_flag=True, default=False)
@click.pass_context
def download_tree(ctx, tree_id, public_ids):
    api_client = ctx.obj["api_client"]
    params = {}
    if public_ids:
        params["id_style"] = "public"
    else:
        params["id_style"] = "private"
    resp = api_client.get(f"/v2/phylo_trees/{tree_id}/download", params=params)
    print(resp.text)


@phylo_trees.command(name="get-sample-ids")
@click.argument("tree_id")
@click.option("--public-ids/--private-ids", is_flag=True, default=False)
@click.pass_context
def get_tree_sample_ids(ctx, tree_id, public_ids):
    api_client = ctx.obj["api_client"]
    params = {}
    if public_ids:
        params["id_style"] = "public"
    else:
        params["id_style"] = "private"
    resp = api_client.get(f"/v2/phylo_trees/{tree_id}/sample_ids", params=params)
    print(resp.text)


@cli.group()
def locations():
    pass


@locations.command(name="list")
@click.pass_context
def list_locations(ctx):
    api_client = ctx.obj["api_client"]
    resp = api_client.get("/v2/locations/")
    print(resp.text)


@locations.command(name="search")
@click.option(
    "--region",
    required=False,
    type=str,
    help="A continental-level region, e.g. North America, Asia. In practice, you do not need to provide this.",
)
@click.option(
    "--country", required=False, type=str, help="A country, e.g. USA, Canada."
)
@click.option(
    "--division",
    required=False,
    type=str,
    help="A top-level division of a country, e.g. California, British Columbia.",
)
@click.option(
    "--location",
    required=False,
    type=str,
    help="A secondary division of a country, e.g. Alameda County, Toronto.",
)
@click.pass_context
def search_locations(
    ctx,
    region: Optional[str],
    country: Optional[str],
    division: Optional[str],
    location: Optional[str],
):
    if not region and not country and not division and not location:
        print("Must provide at least one of region, country, division, or location.")
        return

    api_client = ctx.obj["api_client"]
    payload = {
        "region": region,
        "country": country,
        "division": division,
        "location": location,
    }
    resp = api_client.post(f"/v2/locations/search/", json=payload)
    locations = resp.json()["locations"]
    location_columns = ["region", "country", "division", "location", "id"]
    location_values = [
        [entry.get(column) for column in location_columns] for entry in locations
    ]
    print(tabulate(location_values, headers=location_columns, tablefmt="psql"))


@cli.group()
def lineages():
    pass


@lineages.command(name="list-pango")
@click.pass_context
def list_all_pango_lineages(ctx):
    api_client = ctx.obj["api_client"]
    resp = api_client.get("/v2/lineages/pango")
    print(resp.text)


@cli.group()
def samples():
    pass


@samples.command(name="list")
@click.pass_context
def list_samples(ctx):
    api_client = ctx.obj["api_client"]
    resp = api_client.get_with_org("/v2/samples/")
    print(resp.text)


@samples.command(name="download")
@click.argument("sample_ids", nargs=-1)
@click.pass_context
def download_samples(ctx, sample_ids):
    api_client = ctx.obj["api_client"]
    payload = {"requested_sequences": {"sample_ids": sample_ids}}
    resp = api_client.post("/v2/sequences", json=payload)
    print(resp.headers)
    print(resp.text)


@samples.command(name="delete")
@click.argument("sample_ids", nargs=-1)
@click.pass_context
def delete_samples(ctx, sample_ids):
    api_client = ctx.obj["api_client"]
    if len(sample_ids) == 1:
        resp = api_client.delete_with_org(f"/v2/samples/{sample_ids[0]}")
        print(resp.headers)
        print(resp.text)
        return
    resp = api_client.delete_with_org(f"/v2/samples/", json={"ids": sample_ids})
    print(resp.headers)
    print(resp.text)


@samples.command(name="update")
@click.argument("sample_id", required=False)
@click.option(
    "--private-id", required=False, type=str, help="Update the sample private id"
)
@click.option(
    "--public-id", required=False, type=str, help="Update the sample public id"
)
@click.option(
    "--collection-date",
    required=False,
    type=str,
    help="Update the sample collection date",
)
@click.option(
    "--sequencing-date",
    required=False,
    type=str,
    help="Update the sample sequencing date",
)
@click.option(
    "--private", required=False, type=bool, help="Set whether the sample is private"
)
@click.option(
    "--location", required=False, type=int, help="Set the sample's collection location"
)
@click.option("--json-data", required=False, type=str, help="provide json for update")
@click.pass_context
def update_samples(
    ctx,
    sample_id,
    private_id,
    public_id,
    collection_date,
    sequencing_date,
    private,
    location,
    json_data,
):
    api_client = ctx.obj["api_client"]
    if json:
        resp = api_client.put_with_org(f"/v2/samples/", json=json.loads(json_data))
        print(resp.text)
    else:
        if collection_date:
            collection_date = dateparser.parse(collection_date).strftime("%Y-%m-%d")
        if sequencing_date:
            sequencing_date = dateparser.parse(sequencing_date).strftime("%Y-%m-%d")
        all_fields = {
            "id": sample_id,
            "public_identifier": public_id,
            "private_identifier": private_id,
            "collection_date": collection_date,
            "sequencing_date": sequencing_date,
            "collection_location": location,
            "private": private,
        }
        # Remove None fields
        sample = {k: v for k, v in all_fields.items() if v != None}
        print(sample)
        if public_id:
            sample["public_identifier"] = public_id
        if private_id:
            sample["private_identifier"] = private_id
        resp = api_client.put(f"/v2/samples/", json={"samples": [sample]})
        print(resp.text)


@samples.command(name="create")
@click.option("--private-id", required=True, type=str, help="Sample private id")
@click.option("--public-id", required=False, type=str, help="Sample public id")
@click.option(
    "--collection-date",
    required=False,
    type=str,
    help="Sample collection date",
)
@click.option(
    "--sequencing-date",
    required=False,
    type=str,
    help="Sample sequencing date",
)
@click.option(
    "--sequence",
    required=True,
    type=str,
    help="Sample sequence",
)
@click.option(
    "--private", default=False, type=bool, help="Set whether the sample is private"
)
@click.option(
    "--location", required=True, type=int, help="Set the sample's collection location"
)
@click.pass_context
def create_samples(
    ctx,
    private_id,
    public_id,
    collection_date,
    sequencing_date,
    sequence,
    private,
    location,
):
    api_client = ctx.obj["api_client"]
    if collection_date:
        collection_date = dateparser.parse(collection_date).strftime("%Y-%m-%d")
    if sequencing_date:
        sequencing_date = dateparser.parse(sequencing_date).strftime("%Y-%m-%d")
    sample = {
        "pathogen_genome": {
            "sequence": sequence,
            "sequencing_date": sequencing_date,
        },
        "sample": {
            "public_identifier": public_id,
            "private_identifier": private_id,
            "collection_date": collection_date,
            "location_id": location,
            "private": private,
        },
    }
    # Remove None fields
    print(sample)
    body = [sample]
    resp = api_client.post("/v2/samples/", json=body)
    print(resp.text)


@cli.group()
def phylo_runs():
    pass


@phylo_runs.command(name="create")
@click.option("-n", "--name", required=True, type=str)
@click.option(
    "-t",
    "--type",
    "tree_type",
    required=True,
    type=click.Choice(
        ["OVERVIEW", "TARGETED", "NON_CONTEXTUALIZED"], case_sensitive=False
    ),
)
@click.option("-a", "--template-args", "template_args", required=False, type=str)
@click.option("-h", "--show-headers", is_flag=True)
@click.argument("sample_ids", nargs=-1)
@click.pass_context
def start_phylo_run_v2(ctx, name, tree_type, template_args, sample_ids, show_headers):
    api_client = ctx.obj["api_client"]
    payload = {"name": name, "tree_type": tree_type, "samples": sample_ids}
    if template_args:
        payload["template_args"] = json.loads(template_args)
    print(json.dumps(payload))
    resp = api_client.post("/v2/phylo_runs/", json=payload)
    if show_headers:
        print(resp.headers)
    print(resp.text)
    print(resp)


@phylo_runs.command(name="update")
@click.argument("run_id")
@click.option("--name", required=False, type=str, help="Update the run name")
@click.pass_context
def update_phylorun(ctx, run_id, name):
    api_client = ctx.obj["api_client"]
    body = {
        "name": name,
    }
    resp = api_client.put(f"/v2/phylo_runs/{run_id}", json=body)
    print(resp.headers)
    print(resp.text)


@samples.command(name="validate-ids")
@click.option("-h", "--show-headers", is_flag=True)
@click.argument("sample_ids", nargs=-1)
@click.pass_context
def validate_sample_ids(ctx, sample_ids, show_headers):
    api_client = ctx.obj["api_client"]
    payload = {"sample_ids": sample_ids}
    resp = api_client.post_with_org("/v2/samples/validate_ids/", json=payload)
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


@phylo_runs.command(name="list")
@click.option("--print-headers", is_flag=True, default=False)
@click.pass_context
def list_runs(ctx, print_headers):
    api_client = ctx.obj["api_client"]
    resp = api_client.get_with_org(f"/v2/phylo_runs/")
    if print_headers:
        print(resp.headers)
    print(resp.text)


if __name__ == "__main__":
    cli()
