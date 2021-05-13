from dataclasses import dataclass
from typing import Mapping, MutableMapping

from auth0.v3 import authentication as auth0_authentication
from auth0.v3 import management as auth0_management
from sqlalchemy.orm import Session

from aspen.config import config as aspen_config
from aspen.database.models import Group
from covid_database import init_db as covidhub_init_db
from covid_database import SqlAlchemyInterface as CSqlAlchemyInterface
from covid_database import util as covidhub_database_util


def covidhub_interface_from_secret(
    covidhub_aws_profile: str, secret_id: str
) -> CSqlAlchemyInterface:
    interface = covidhub_init_db(
        covidhub_database_util.get_db_uri(secret_id, aws_profile=covidhub_aws_profile)
    )
    return interface


def get_or_make_group(session: Session, name: str, address: str) -> Group:
    group = session.query(Group).filter(Group.name == name).one_or_none()
    if group is None:
        # copy the project info into the "group"
        group = Group(
            name=name,
            address=address,
        )
        session.add(group)

    return group


@dataclass
class Auth0Entry:
    nickname: str
    email: str
    auth0_token: str


def retrieve_auth0_users(config: aspen_config.Config) -> Mapping[str, Auth0Entry]:
    """Retrieves an auth0 token and then retrieve a user list.  Each element of the list
    is a tuple of (name, email, auth0_token)."""
    domain = config.AUTH0_DOMAIN
    client_id = config.AUTH0_MANAGEMENT_CLIENT_ID
    client_secret = config.AUTH0_MANAGEMENT_CLIENT_SECRET

    get_token_response = auth0_authentication.GetToken(domain)
    token = get_token_response.client_credentials(
        client_id, client_secret, "https://{}/api/v2/".format(domain)
    )
    mgmt_api_token = token["access_token"]
    auth0_client = auth0_management.Auth0(domain, mgmt_api_token)

    all_users: MutableMapping[str, Auth0Entry] = dict()
    page = 0
    while True:
        try:
            users_response = auth0_client.users.list(page=page)
            if users_response["length"] == 0:
                # done!
                break

            # concatenate the results to all_users.
            for user in users_response["users"]:
                all_users[user["user_id"]] = Auth0Entry(
                    user["nickname"], user["email"], user["user_id"]
                )
        finally:
            page += 1

    return all_users
