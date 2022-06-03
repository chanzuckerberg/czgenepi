#!/usr/bin/env python3
import logging
from typing import Any, List, MutableSequence, Optional, Tuple

import click
import sqlalchemy as sa
from sqlalchemy.orm.session import Session

from aspen.auth.auth0_management import Auth0Client, Auth0Org, Auth0User
from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import Group, User


class ObjectManager:
    auth0_id_field: Optional[str] = None
    auth0_match_field: str = ""
    db_match_field: str = ""

    def __init__(self, auth0_client: Auth0Client, db: Session, dry_run: bool) -> None:
        self.auth0_client = auth0_client
        self.db = db
        self.dry_run = dry_run

    def auth0_delete(self, ojbect: Any) -> None:
        raise NotImplementedError("Please implement this method")

    def db_delete(self, ojbect: Any) -> None:
        raise NotImplementedError("Please implement this method")

    def auth0_create(self, ojbect: Any) -> Optional[Any]:
        raise NotImplementedError("Please implement this method")

    def db_create(self, ojbect: Any) -> None:
        raise NotImplementedError("Please implement this method")


class UserGroupManager(ObjectManager):
    auth0_match_field = "user_id"
    db_match_field = "auth0_user_id"

    def __init__(
        self,
        auth0_client: Auth0Client,
        db: Session,
        dry_run: bool,
        auth0_group: Auth0Org,
        db_group: Group,
    ) -> None:
        super().__init__(auth0_client, db, dry_run)
        self.db_group = db_group
        self.auth0_group = auth0_group

    def auth0_delete(self, auth0_user: Auth0User) -> None:
        logging.info(
            f"Deleting auth0 user {auth0_user['user_id']} from group {self.auth0_group['display_name']}"
        )
        if self.dry_run:
            return
        self.auth0_client.remove_org_member(self.auth0_group, auth0_user["user_id"])
        logging.info("...done")

    def db_delete(self, db_user: User) -> None:
        logging.info(
            f"Deleting user {db_user.auth0_user_id} from db group {self.db_group.name}"
        )
        if self.dry_run:
            return
        # TODO - this is complicated and we don't even know if we want it.
        raise Exception("Removing users from DB groups is not supported")

    def auth0_create(self, db_user: User) -> None:
        logging.info(
            f"Adding db user {db_user.auth0_user_id} to group {self.auth0_group['display_name']}"
        )
        if self.dry_run:
            return
        self.auth0_client.add_org_member(self.auth0_group, db_user.auth0_user_id)
        logging.info("...done")

    def db_create(self, auth0_user: Auth0User) -> None:
        logging.info(
            f"Adding db user {auth0_user['user_id']} to group {self.db_group.name}"
        )
        if self.dry_run:
            return
        user: User = (
            self.db.execute(
                sa.select(User).where(User.auth0_user_id == auth0_user["user_id"])  # type: ignore
            )
            .scalars()
            .one()
        )
        user.group = self.db_group
        logging.info("...done")


class GroupManager(ObjectManager):
    auth0_id_field = "auth0_org_id"
    auth0_match_field = "display_name"
    db_match_field = "name"

    def auth0_delete(self, auth0_group: Auth0Org) -> None:
        logging.info(f"Deleting auth0 group {auth0_group['name']}")
        if self.dry_run:
            return
        self.auth0_client.delete_org(auth0_group["id"])
        logging.info("...done")

    def db_delete(self, db_group: Group) -> None:
        logging.info(f"Deleting db group {db_group.name}")
        if self.dry_run:
            return
        # TODO - this is complicated and we don't even know if we want it.
        raise Exception("deleting orgs is not currently supported")

    def auth0_create(self, db_group: Group) -> Optional[Auth0Org]:
        logging.info(f"Adding auth0 group {db_group.name}")
        if self.dry_run:
            return None
        res = self.auth0_client.add_org(db_group.id, db_group.name)
        logging.info("...done")
        return res

    def db_create(self, auth0_group: Group) -> None:
        logging.info(f"Adding db group {auth0_group['display_name']}")
        if self.dry_run:
            return
        group = Group(
            name=auth0_group["display_name"],
            prefix=auth0_group["name"],
            auth0_org_id=auth0_group["id"],
        )
        self.db.add(group)
        logging.info("...done")


class UserManager(ObjectManager):
    auth0_id_field = "auth0_user_id"
    auth0_match_field = "user_id"
    db_match_field = "auth0_user_id"

    def auth0_delete(self, auth0_user: Auth0User) -> None:
        logging.info(f"Deleting auth0 user {auth0_user['email']}")
        if self.dry_run:
            return
        self.auth0_client.delete_user(auth0_user["user_id"])
        logging.info("...done")

    def db_delete(self, db_user: User) -> None:
        logging.info(f"Deleting db user {db_user.auth0_user_id}")
        if self.dry_run:
            return
        # TODO - this is complicated and we don't even know if we want it.
        raise Exception("Removing users from DB groups is not supported")

    def auth0_create(self, db_user: User) -> Optional[Auth0User]:
        logging.info(f"Adding db user {db_user.email} to auth0")
        if self.dry_run:
            return None
        res = self.auth0_client.create_user(db_user.email, db_user.name)
        logging.info("...done")
        return res

    def db_create(self, auth0_user: Auth0User) -> None:
        logging.info(f"Adding auth0 user {auth0_user['email']} to db")
        if self.dry_run:
            return
        # TODO - this is complicated and we don't even know if we want it.
        raise Exception("Creating db users from DB groups is not supported")


class SuperSyncer:
    def __init__(
        self,
        auth0_client: Auth0Client,
        source_of_truth: str,
        db: Session,
        dry_run: bool,
        delete_ok: bool,
    ) -> None:
        self.auth0_client = auth0_client
        self.db = db
        self.dry_run = dry_run
        self.source_of_truth = source_of_truth
        self.delete_ok = delete_ok

    def find_missing_objects(
        self,
        auth0_objects: MutableSequence[Any],
        db_objects: MutableSequence[Any],
        auth0_match_field: str,
        db_match_field: str,
    ) -> Tuple[
        MutableSequence[Any], MutableSequence[Any], MutableSequence[Tuple[Any, Any]]
    ]:
        db_map = {getattr(obj, db_match_field): obj for obj in db_objects}
        auth0_map = {obj[auth0_match_field]: obj for obj in auth0_objects}
        auth0_only = [auth0_map[key] for key in auth0_map.keys() - db_map.keys()]
        db_only = [db_map[key] for key in db_map.keys() - auth0_map.keys()]
        matching_tuples = [
            (db_map[key], auth0_map[key])
            for key in set(db_map.keys()) & set(auth0_map.keys())
        ]
        return auth0_only, db_only, matching_tuples

    def update_objects(
        self, object_manager: ObjectManager, auth0_objects: Any, db_objects: Any
    ) -> None:
        # Only add/create entries in the data store that is NOT our designated
        # source of truth.
        auth0_only, db_only, matching_tuples = self.find_missing_objects(
            auth0_objects,
            db_objects,
            object_manager.auth0_match_field,
            object_manager.db_match_field,
        )
        # Set db object ID's to use the proper auth0 id wherever possible:
        db_key_name = object_manager.auth0_id_field
        if db_key_name:
            for db_obj, auth0_obj in matching_tuples:
                setattr(db_obj, db_key_name, auth0_obj["id"])
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
            res = create_callback(obj)
            if res:
                print(res)
                setattr(obj, object_manager.auth0_id_field, res["id"])
        if self.delete_ok:
            for obj in to_delete:
                delete_callback(obj)

    def sync_users(self) -> None:
        db_users: MutableSequence[User] = (
            self.db.execute(sa.select(User)).scalars().all()  # type: ignore
        )
        auth0_users: List[Auth0User] = self.auth0_client.get_users()
        user_manager = UserManager(self.auth0_client, self.db, self.dry_run)
        self.update_objects(user_manager, auth0_users, db_users)

    def sync_groups(self) -> None:
        db_groups: MutableSequence[Group] = (
            self.db.execute(sa.select(Group)).scalars().all()  # type: ignore
        )
        auth0_orgs: List[Auth0Org] = self.auth0_client.get_orgs()
        group_manager = GroupManager(self.auth0_client, self.db, self.dry_run)
        self.update_objects(group_manager, auth0_orgs, db_groups)

    def sync_memberships(self) -> None:
        auth0_orgs: List[Auth0Org] = self.auth0_client.get_orgs()
        db_groups: MutableSequence[Group] = (
            (self.db.execute(sa.select(Group))).scalars().all()  # type: ignore
        )
        for org in auth0_orgs:
            auth0_memberships: List[Auth0User] = self.auth0_client.get_org_members(org)
            # TODO, we might want to stuff the auth0 group ID's into the groups table to
            # make this simpler.
            found_groups: MutableSequence[Group] = [
                group for group in db_groups if group.name == org["display_name"]
            ]
            if not found_groups:
                # We're assuming that at this point in the script, we've already sync'd
                # whatever groups we plan to sync, and if we don't find matching groups
                # in both data stores, it's intentional for some reason.
                logging.warning(
                    f"Skipping sync of group {org['display_name']} - no DB row"
                )
                continue
            db_group: Group = found_groups[0]
            db_group_users: MutableSequence[User] = (
                self.db.execute(sa.select(User).where(User.group == db_group))  # type: ignore
                .scalars()
                .all()
            )
            # TODO - right now if a user is a member of an auth0 org, we consider
            # that "good enough" for the purposes of this sync script. We need to *ALSO*
            # validate that they have the correct role, but that will be more important
            # in the next version, so we're skipping that right now.
            group_manager = UserGroupManager(
                self.auth0_client, self.db, self.dry_run, org, db_group
            )
            self.update_objects(group_manager, auth0_memberships, db_group_users)


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
def cli(
    source_of_truth: str,
    dry_run: bool,
    delete_ok: bool,
    sync_groups: bool,
    sync_users: bool,
    sync_memberships: bool,
) -> None:
    config = Config()
    client_id: str = config.AUTH0_MANAGEMENT_CLIENT_ID
    client_secret: str = config.AUTH0_MANAGEMENT_CLIENT_SECRET
    domain: str = config.AUTH0_MANAGEMENT_DOMAIN
    auth0_client = Auth0Client(client_id, client_secret, domain)

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
    with session_scope(interface) as db:
        syncer = SuperSyncer(auth0_client, source_of_truth, db, dry_run, delete_ok)
        if sync_users:
            logging.info("Syncing users")
            syncer.sync_users()
    with session_scope(interface) as db:
        syncer = SuperSyncer(auth0_client, source_of_truth, db, dry_run, delete_ok)
        if sync_memberships:
            logging.info("Syncing memberships")
            syncer.sync_memberships()


if __name__ == "__main__":
    cli()
