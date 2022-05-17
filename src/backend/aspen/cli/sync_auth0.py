import logging
import os
from functools import cache, partial
from typing import MutableSequence

import click
import sqlalchemy as sa
from auth0.v3 import authentication as auth0_authentication
from auth0.v3.management import Auth0

from aspen.api.settings import Settings
from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import Group, User


class Auth0Client:
    def __init__(self):
        # TODO these will need to be read from settings instead of env.
        client_id = os.environ.get("AUTH0_CLIENT_ID")
        client_secret = os.environ.get("AUTH0_CLIENT_SECRET")
        domain = os.environ.get("AUTH0_DOMAIN")
        auth_req = auth0_authentication.GetToken(domain)
        token = auth_req.client_credentials(
            client_id, client_secret, f"https://{domain}/api/v2/"
        )

        self.client = Auth0(domain=domain, token=token["access_token"])

    def get_all_results(self, endpoint, key):
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

    def get_users(self):
        return self.get_all_results(self.client.users.list, "users")

    def get_orgs(self):
        return self.get_all_results(
            self.client.organizations.all_organizations, "organizations"
        )

    @cache
    def get_auth0_role(self, role_name):
        all_roles = self.get_roles()
        for role in all_roles:
            if role["name"] == role_name:
                return role

    @cache
    def get_roles(self):
        return self.get_all_results(self.client.roles.list, "roles")

    def get_org_members(self, org):
        return self.get_all_results(
            partial(self.client.organizations.all_organization_members, org["id"]),
            "members",
        )

    def add_org_member(self, org, user_id):
        self.client.organizations.create_organization_members(
            org["id"], {"members": [user_id]}
        )
        member_role = self.get_auth0_role("member")
        self.client.organizations.create_organization_member_roles(
            org["id"], user_id, {"roles": [member_role["id"]]}
        )

    def remove_org_member(self, org, user_id):
        self.client.organizations.delete_organization_members(
            org["id"], {"members": [user_id]}
        )


def compare_stuff(auth0_objects, db_objects, auth0_match_field, db_match_field):
    db_identifiers = {getattr(obj, db_match_field) for obj in db_objects}
    auth0_identifiers = {obj[auth0_match_field] for obj in auth0_objects}
    auth0_only = auth0_identifiers - db_identifiers
    db_only = db_identifiers - auth0_identifiers
    return auth0_only, db_only


class UserGroupManager:
    def __init__(self, auth0_client, db, dry_run, auth0_group, db_group):
        self.auth0_client = auth0_client
        self.db = db
        self.dry_run = dry_run
        self.db_group = db_group
        self.auth0_group = auth0_group

    def auth0_delete(self, auth0_user_id):
        logging.info(
            f"Deleting auth0 user {auth0_user_id} from group {self.auth0_group['display_name']}"
        )
        if self.dry_run:
            return
        self.auth0_client.remove_org_member(self.auth0_group, auth0_user_id)
        logging.info("...done")

    def db_delete(self, auth0_user_id):
        logging.info(
            f"Deleting user {auth0_user_id} from db group {self.db_group.name}"
        )
        if self.dry_run:
            return
        auth0_user_id.group = self.db_group
        logging.info("...done")

    def auth0_create(self, auth0_user_id):
        logging.info(
            f"Adding auth0 user {auth0_user_id} to group {self.auth0_group['display_name']}"
        )
        if self.dry_run:
            return
        self.auth0_client.add_org_member(self.auth0_group, auth0_user_id)
        logging.info("...done")

    def db_create(self, auth0_user_id):
        logging.info(f"Adding db user {auth0_user_id} to group {self.db_group.name}")
        if self.dry_run:
            return
        user = (
            self.db.execute(sa.select(User).where(User.auth0_user_id == auth0_user_id))
            .scalars()
            .one()
        )
        user.group = self.db_group
        logging.info("...done")


class GroupManager:
    def __init__(self, auth0_client, db, dry_run):
        self.auth0_client = auth0_client
        self.db = db
        self.dry_run = dry_run

    def auth0_delete(self, group):
        logging.info(f"Deleting auth0 group {group}")
        if self.dry_run:
            return
        logging.info("...done")

    def db_delete(self, group):
        logging.info(f"Deleting db group {group}")
        if self.dry_run:
            return
        logging.info("...done")

    def auth0_create(self, group):
        logging.info(f"Adding auth0 group {group}")
        if self.dry_run:
            return
        logging.info("...done")

    def db_create(self, group):
        logging.info(f"Adding db group {group}")
        if self.dry_run:
            return
        logging.info("...done")


class UserManager:
    def __init__(self, auth0_client, db, dry_run):
        self.auth0_client = auth0_client
        self.db = db
        self.dry_run = dry_run

    def auth0_delete(self, user):
        logging.info(f"Deleting auth0 user {user}")
        if self.dry_run:
            return
        logging.info("...done")

    def db_delete(self, user):
        logging.info(f"Deleting db user {user}")
        if self.dry_run:
            return
        logging.info("...done")

    def auth0_create(self, user):
        logging.info(f"Adding auth0 user {user}")
        if self.dry_run:
            return
        logging.info("...done")

    def db_create(self, user):
        logging.info(f"Adding db user {user}")
        if self.dry_run:
            return
        logging.info("...done")


class SuperSyncer:
    def __init__(
        self, auth0_client, source_of_truth, db, dry_run: bool, delete_ok: bool
    ):
        self.auth0_client = auth0_client
        self.db = db
        self.dry_run = dry_run
        self.source_of_truth = source_of_truth
        self.delete_ok = delete_ok

    def update_objects(self, auth0_only, db_only, object_manager):
        # Only add/create entries in the data store that is NOT our designated
        # source of truth.
        if self.source_of_truth == "auth0":
            delete_callback = object_manager.db_delete
            create_callback = object_manager.db_create
            to_add = auth0_only
            to_delete = db_only
        else:
            delete_callback = object_manager.auth0_delete
            create_callback = object_manager.auth0_create
            to_add = db_only
            to_delete = auth0_only
        for obj in to_add:
            create_callback(obj)
        if self.delete_ok:
            for obj in to_delete:
                delete_callback(obj)

    def sync_users(self):
        db_users: MutableSequence[User] = (
            self.db.execute(sa.select(User)).scalars().all()
        )
        auth0_users = self.auth0_client.get_users()
        auth0_only, db_only = compare_stuff(
            auth0_users, db_users, "user_id", "auth0_user_id"
        )
        user_manager = UserManager(self.auth0_client, self.db, self.dry_run)
        self.update_objects(auth0_only, db_only, user_manager)

    def sync_groups(self):
        db_groups: MutableSequence[Group] = (
            self.db.execute(sa.select(Group)).scalars().all()
        )
        auth0_orgs = self.auth0_client.get_orgs()
        auth0_only, db_only = compare_stuff(
            auth0_orgs, db_groups, "display_name", "name"
        )
        group_manager = GroupManager(self.auth0_client, self.db, self.dry_run)
        self.update_objects(auth0_only, db_only, group_manager)

    def sync_memberships(self):
        auth0_orgs = self.auth0_client.get_orgs()
        db_groups: MutableSequence[Group] = (
            (self.db.execute(sa.select(Group))).scalars().all()
        )
        for org in auth0_orgs:
            auth0_memberships = self.auth0_client.get_org_members(org)
            # TODO, we might want to stuff the auth0 group ID's into the groups table to
            # make this simpler.
            db_group = [
                group for group in db_groups if group.name == org["display_name"]
            ]
            if not db_group:
                # We're assuming that at this point in the script, we've already sync'd
                # whatever groups we plan to sync, and if we don't find matching groups
                # in both data stores, it's intentional for some reason.
                logging.warning(
                    f"Skipping sync of group {org['display_name']} - no DB row"
                )
                continue
            db_group = db_group[0]
            db_group_users = (
                self.db.execute(sa.select(User).where(User.group == db_group))
                .scalars()
                .all()
            )
            auth0_only, db_only = compare_stuff(
                auth0_memberships, db_group_users, "user_id", "auth0_user_id"
            )
            group_manager = UserGroupManager(
                self.auth0_client, self.db, self.dry_run, org, db_group
            )
            self.update_objects(auth0_only, db_only, group_manager)


@click.command("sync_users")
@click.option(
    "--source-of-truth",
    default="db",
    type=click.Choice(["db", "auth0"]),
    help="Create Auth0 users/groups for any DB users/groups without Auth0 accounts",
)
@click.option(
    "--dry-run",
    is_flag=True,
    default=False,
    help="Whether to only print what actions this script would take instead of actually applying changes",
)
@click.option(
    "--delete-ok",
    is_flag=True,
    default=False,
    help="Whether to delete objects from the destination data store if there aren't matching objects in the source of truth",
)
@click.option(
    "--sync-groups/--no-sync-groups", is_flag=True, default=True, help="Sync groups"
)
@click.option(
    "--sync-users/--no-sync-users", is_flag=True, default=True, help="Sync users"
)
@click.option(
    "--sync-memberships/--no-sync-memberships",
    is_flag=True,
    default=True,
    help="Sync membership",
)
def cli(source_of_truth, dry_run, delete_ok, sync_groups, sync_users, sync_memberships):
    settings = Settings()
    auth0_client = Auth0Client()

    logging.basicConfig(
        format="%(levelname)s %(asctime)s - %(message)s", level=logging.INFO
    )
    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))
    sync_dest = "auth0" if source_of_truth == "db" else "auth0"
    logging.info(f"Source of truth: {source_of_truth} // Syncing {sync_dest} to match!")
    if delete_ok:
        logging.info(
            "Delete mode enabled - objects without matching entries in the source of truth will be obliterated."
        )
    if dry_run:
        logging.info("Dry run mode enabled - no objects will actually be modified")
    with session_scope(interface) as db:
        syncer = SuperSyncer(auth0_client, source_of_truth, db, dry_run, delete_ok)
        if sync_groups:
            logging.info("Syncing groups")
            syncer.sync_groups()
        if sync_users:
            logging.info("Syncing users")
            syncer.sync_users()
        if sync_memberships:
            logging.info("Syncing memberships")
            syncer.sync_memberships()


if __name__ == "__main__":
    cli()
