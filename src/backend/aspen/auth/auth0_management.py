import random
import string
from functools import cache, partial
from typing import Any, Callable, List, TypedDict

from auth0.v3 import authentication as auth0_authentication
from auth0.v3.management import Auth0


class Auth0Org(TypedDict):
    id: str
    name: str
    display_name: str


class Auth0User(TypedDict):
    user_id: str
    name: str
    email: str


class Auth0Role(TypedDict):
    id: str
    name: str


class Auth0Connection(TypedDict):
    id: str
    name: str


def generate_password(length: int = 22) -> str:
    possible_characters = (
        string.ascii_uppercase + string.ascii_lowercase + string.digits
    )
    return "".join(random.choice(possible_characters) for _ in range(length))


class Auth0Client:
    def __init__(self, client_id, client_secret, domain) -> None:
        auth_req = auth0_authentication.GetToken(domain)
        token = auth_req.client_credentials(
            client_id, client_secret, f"https://{domain}/api/v2/"
        )

        self.client: Auth0 = Auth0(domain=domain, token=token["access_token"])

    def get_all_results(self, endpoint: Callable, key: str) -> List[Any]:
        # Auth0 paginates results. We don't have a crazy amount of data in auth0 so we can
        # afford to just paginate through all the results and hold everything in memory.
        results = []
        page = 0
        per_page = 25
        while True:
            resp = endpoint(page=page, per_page=per_page)
            last_result = resp["start"] + resp["limit"]
            results.extend(resp[key])
            if last_result >= resp["total"]:
                return results
            page += 1

    def get_users(self) -> List[Auth0User]:
        return self.get_all_results(self.client.users.list, "users")

    @cache
    def get_org(self, org_name: str) -> Auth0Org:
        orgs = self.get_orgs()
        for org in orgs:
            if org["display_name"] == org_name:
                return org
        raise Exception("Organization not found")

    @cache
    def get_orgs(self) -> List[Auth0Org]:
        return self.get_all_results(
            self.client.organizations.all_organizations, "organizations"
        )

    @cache
    def get_auth0_role(self, role_name: str) -> Auth0Role:
        all_roles = self.get_roles()
        for role in all_roles:
            if role["name"] == role_name:
                return role
        raise Exception("Role not found")

    @cache
    def get_roles(self) -> List[Auth0Role]:
        return self.get_all_results(self.client.roles.list, "roles")

    @cache
    def get_connection(self, conn_name: str) -> Auth0Connection:
        all_conns = self.get_connections()
        for conn in all_conns:
            if conn["name"] == conn_name:
                return conn
        raise Exception("Connection not found")

    @cache
    def get_connections(self) -> List[Auth0Connection]:
        extra_params = {"include_totals": "true"}
        return self.get_all_results(
            partial(self.client.connections.all, extra_params=extra_params),
            "connections",
        )

    def get_org_members(self, org: Auth0Org) -> List[Auth0User]:
        return self.get_all_results(
            partial(self.client.organizations.all_organization_members, org["id"]),
            "members",
        )

    def add_org_member(self, org: Auth0Org, user_id: str) -> None:
        self.client.organizations.create_organization_members(
            org["id"], {"members": [user_id]}
        )
        member_role = self.get_auth0_role("member")
        self.client.organizations.create_organization_member_roles(
            org["id"], user_id, {"roles": [member_role["id"]]}
        )

    def remove_org_member(self, org: Auth0Org, user_id: str) -> None:
        self.client.organizations.delete_organization_members(
            org["id"], {"members": [user_id]}
        )

    def add_org(self, group_id: int, org_name: str) -> None:
        # TODO, learn more about connections! For now we only have this one, let's use it wherever we need to.
        connection = self.get_connection("Username-Password-Authentication")
        body = {
            "name": f"group-{group_id}",
            "display_name": org_name,
            "enabled_connections": [
                {
                    "connection_id": connection["id"],
                    "assign_membership_on_login": False,
                }
            ],
        }
        self.client.organizations.create_organization(body)

    def delete_org(self, org_id: str) -> None:
        self.client.organizations.delete_organization(org_id)

    def create_user(self, email: str, name: str) -> None:
        body = {
            "email": email,
            "user_metadata": {},
            "email_verified": True,
            "name": name,
            "verify_email": False,
            "password": generate_password(),
            "connection": "Username-Password-Authentication",
        }
        self.client.users.create(body)

    def delete_user(self, auth0_user_id: str) -> None:
        self.client.users.delete(auth0_user_id)

    def invite_member(
        self,
        organization_id: str,
        client_id: str,
        invited_by: str,
        invite_email: str,
        role_name: str,
    ) -> None:
        role = self.get_auth0_role(role_name)
        connection = self.get_connection("Username-Password-Authentication")
        body = {
            "inviter": {
                "name": invited_by,
            },
            "invitee": {
                "email": invite_email,
            },
            "client_id": client_id,
            "connection_id": connection["id"],
            "app_metadata": {},
            "user_metadata": {},
            "ttl_sec": 0,
            "roles": [role["id"]],
            "send_invitation_email": True,
        }
        self.client.organizations.create_organization_invitation(organization_id, body)
