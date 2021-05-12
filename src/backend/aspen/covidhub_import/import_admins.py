import json
import logging
from typing import Iterable, Mapping

from sqlalchemy.orm import configure_mappers, Session

from aspen.covidhub_import.utils import (
    Auth0Entry,
    covidhub_interface_from_secret,
    get_or_make_group,
)
from aspen.database.connection import session_scope, SqlAlchemyInterface
from aspen.database.models import Group, User
from covid_database.models import covidtracker

logger = logging.getLogger(__name__)


def import_covidhub_admins(
    interface: SqlAlchemyInterface,
    covidhub_aws_profile: str,
    covidhub_secret_id: str,
    auth0_usermap: Mapping[str, Auth0Entry],
    admin_group_name: str = "Admin",
):
    configure_mappers()
    covidhub_interface = covidhub_interface_from_secret(
        covidhub_aws_profile, covidhub_secret_id
    )
    covidhub_session: Session = covidhub_interface.make_session()

    with session_scope(interface) as session:
        admin_users: Iterable[covidtracker.UsersGroups] = (
            covidhub_session.query(covidtracker.UsersGroups)
            .join(covidtracker.Group)
            .filter(covidtracker.Group.name == admin_group_name)
        )

        group: Group = get_or_make_group(
            session,
            "admin",
            "n/a",
        )

        # create the users!
        for admin_user in admin_users:
            # try to find the user in the auth0_usermap
            auth0_user = auth0_usermap.get(admin_user.user_id, None)
            if auth0_user is None:
                continue

            # try to create this user in the aspen db.
            user = (
                session.query(User).filter(User.email == auth0_user.email).one_or_none()
            )
            if user is None:
                user = User()

            user.name = auth0_user.nickname
            user.email = auth0_user.email
            user.auth0_user_id = auth0_user.auth0_token
            user.group_admin = False
            user.system_admin = True
            user.group = group

        session.commit()
        print(json.dumps({"group_id": group.id}))
