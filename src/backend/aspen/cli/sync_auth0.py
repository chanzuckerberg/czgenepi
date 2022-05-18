#!/usr/bin/env python3
import logging
import os
import random
import string
from functools import cache, partial
from typing import Any, MutableSequence, TypedDict

import click
import sqlalchemy as sa
from auth0.v3 import authentication as auth0_authentication
from auth0.v3.management import Auth0

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import Group, User


class Auth0Org(TypedDict):
    id: str
    name: str
    display_name: str


class Auth0User(TypedDict):
    id: str
    name: str


def generate_password(length=22):
    possible_characters = (
        string.ascii_uppercase + string.ascii_lowercase + string.digits
    )
    return "".join(random.choice(possible_characters) for _ in range(length))


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

    def remove_org_member(self, org: Auth0Org, user_id: int):
        self.client.organizations.delete_organization_members(
            org["id"], {"members": [user_id]}
        )

    def add_org(self, group_id: int, org_name: str):
        body = {
            "name": f"group-{group_id}",
            "display_name": org_name,
        }
        self.client.organizations.create_organization(body)

    def delete_org(self, org_id: int):
        self.client.organizations.delete_organization(org_id)

    def create_user(self, email, name):
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

    def delete_user(self, auth0_user_id):
        self.client.users.delete(auth0_user_id)


def find_missing_objects(auth0_objects, db_objects, auth0_match_field, db_match_field):
    db_map = {getattr(obj, db_match_field): obj for obj in db_objects}
    auth0_map = {obj[auth0_match_field]: obj for obj in auth0_objects}
    auth0_only = [auth0_map[key] for key in auth0_map.keys() - db_map.keys()]
    db_only = [db_map[key] for key in db_map.keys() - auth0_map.keys()]
    return auth0_only, db_only


class UserGroupManager:
    def __init__(
        self, auth0_client, db, dry_run: bool, auth0_group: Auth0Org, db_group: Group
    ):
        self.auth0_client = auth0_client
        self.db = db
        self.dry_run = dry_run
        self.db_group = db_group
        self.auth0_group = auth0_group

    def auth0_delete(self, auth0_user: Auth0User):
        logging.info(
            f"Deleting auth0 user {auth0_user['user_id']} from group {self.auth0_group['display_name']}"
        )
        if self.dry_run:
            return
        self.auth0_client.remove_org_member(self.auth0_group, auth0_user["user_id"])
        logging.info("...done")

    def db_delete(self, db_user: User):
        logging.info(
            f"Deleting user {db_user.auth0_user_id} from db group {self.db_group.name}"
        )
        if self.dry_run:
            return
        # TODO - this is complicated and we don't even know if we want it.
        raise Exception("Removing users from DB groups is not supported")

    def auth0_create(self, db_user: User):
        logging.info(
            f"Adding db user {db_user.auth0_user_id} to group {self.auth0_group['display_name']}"
        )
        if self.dry_run:
            return
        self.auth0_client.add_org_member(self.auth0_group, db_user.auth0_user_id)
        logging.info("...done")

    def db_create(self, auth0_user):
        logging.info(
            f"Adding db user {auth0_user['user_id']} to group {self.db_group.name}"
        )
        if self.dry_run:
            return
        user = (
            self.db.execute(
                sa.select(User).where(User.auth0_user_id == auth0_user["user_id"])
            )
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

    def auth0_delete(self, auth0_group: Auth0Org):
        logging.info(f"Deleting auth0 group {auth0_group['name']}")
        if self.dry_run:
            return
        self.auth0_client.delete_org(auth0_group["id"])
        logging.info("...done")

    def db_delete(self, db_group):
        logging.info(f"Deleting db group {db_group.name}")
        if self.dry_run:
            return
        # TODO - this is complicated and we don't even know if we want it.
        raise Exception("deleting orgs is not currently supported")

    def auth0_create(self, db_group):
        logging.info(f"Adding auth0 group {db_group.name}")
        if self.dry_run:
            return
        self.auth0_client.add_org(db_group.id, db_group.name)
        logging.info("...done")

    def db_create(self, auth0_group):
        logging.info(f"Adding db group {auth0_group['display_name']}")
        if self.dry_run:
            return
        group = Group(name=auth0_group["display_name"], prefix=auth0_group["name"])
        self.db.add(group)
        logging.info("...done")
        return group


class UserManager:
    def __init__(self, auth0_client, db, dry_run):
        self.auth0_client = auth0_client
        self.db = db
        self.dry_run = dry_run

    def auth0_delete(self, auth0_user):
        logging.info(f"Deleting auth0 user {auth0_user['email']}")
        if self.dry_run:
            return
        self.auth0_client.delete_user(auth0_user["user_id"])
        logging.info("...done")

    def db_delete(self, db_user):
        logging.info(f"Deleting db user {db_user.auth0_user_id}")
        if self.dry_run:
            return
        # TODO - this is complicated and we don't even know if we want it.
        raise Exception("Removing users from DB groups is not supported")

    def auth0_create(self, db_user):
        logging.info(f"Adding db user {db_user.email} to auth0")
        if self.dry_run:
            return
        self.auth0_client.create_user(db_user.email, db_user.name)
        logging.info("...done")

    def db_create(self, auth0_user):
        logging.info(f"Adding auth0 user {auth0_user['email']} to db")
        if self.dry_run:
            return
        # TODO - this is complicated and we don't even know if we want it.
        raise Exception("Creating db users from DB groups is not supported")


class SuperSyncer:
    def __init__(
        self, auth0_client, source_of_truth, db, dry_run: bool, delete_ok: bool
    ):
        self.auth0_client = auth0_client
        self.db = db
        self.dry_run = dry_run
        self.source_of_truth = source_of_truth
        self.delete_ok = delete_ok

    def update_objects(self, auth0_only: Any, db_only: Any, object_manager):
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
        auth0_only, db_only = find_missing_objects(
            auth0_users, db_users, "user_id", "auth0_user_id"
        )
        user_manager = UserManager(self.auth0_client, self.db, self.dry_run)
        self.update_objects(auth0_only, db_only, user_manager)

    def sync_groups(self):
        db_groups: MutableSequence[Group] = (
            self.db.execute(sa.select(Group)).scalars().all()
        )
        auth0_orgs = self.auth0_client.get_orgs()
        auth0_only, db_only = find_missing_objects(
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
            # TODO - right now if a user is a member of an auth0 org, we consider
            # that "good enough" for the purposes of this sync script. We need to *ALSO*
            # validate that they have the correct role, but that will be more important
            # in the next version, so we're skipping that right now.
            auth0_only, db_only = find_missing_objects(
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
