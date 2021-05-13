import json
import logging
from typing import Iterable, Mapping

from sqlalchemy.orm import configure_mappers, joinedload, Session

from aspen.covidhub_import.utils import (
    Auth0Entry,
    covidhub_interface_from_secret,
    get_or_make_group,
)
from aspen.database.connection import session_scope, SqlAlchemyInterface
from aspen.database.models import Group, User
from covid_database.models import covidtracker, ngs_sample_tracking

logger = logging.getLogger(__name__)


def import_project_users(
    interface: SqlAlchemyInterface,
    covidhub_aws_profile: str,
    covidhub_secret_id: str,
    rr_project_id: str,
    auth0_usermap: Mapping[str, Auth0Entry],
):
    configure_mappers()
    covidhub_interface = covidhub_interface_from_secret(
        covidhub_aws_profile, covidhub_secret_id
    )
    covidhub_session: Session = covidhub_interface.make_session()

    with session_scope(interface) as session:
        project = (
            covidhub_session.query(ngs_sample_tracking.Project)
            .options(
                joinedload(
                    ngs_sample_tracking.Project.covidtracker_group,
                    covidtracker.GroupToProjects.group,
                )
            )
            .filter(ngs_sample_tracking.Project.rr_project_id == rr_project_id)
            .one()
        )

        group: Group = get_or_make_group(
            session,
            project.covidtracker_group.group.name,
            project.originating_address,
        )

        covidhub_users: Iterable[covidtracker.UsersGroups] = covidhub_session.query(
            covidtracker.UsersGroups
        ).filter(
            covidtracker.UsersGroups.group_id.in_(
                covidhub_session.query(covidtracker.GroupToProjects.group_id)
                .join(ngs_sample_tracking.Project)
                .filter(ngs_sample_tracking.Project.rr_project_id == rr_project_id)
            ),
        )

        # create the users!
        for covidhub_user in covidhub_users:
            # try to find the user in the auth0_usermap
            auth0_user = auth0_usermap.get(covidhub_user.user_id, None)
            if auth0_user is None:
                continue

            # try to create this user in the aspen db.
            user = (
                session.query(User)
                .filter(User.auth0_user_id == auth0_user.auth0_token)
                .one_or_none()
            )
            if user is None:
                user = User()

            user.name = auth0_user.nickname
            user.email = auth0_user.email
            user.auth0_user_id = auth0_user.auth0_token
            user.group_admin = False
            user.system_admin = covidhub_user.group.name == "Admin"
            user.group = group

        session.commit()
        print(json.dumps({"group_id": group.id}))
