from typing import Set

from sqlalchemy.orm.query import Query
from sqlalchemy.sql.expression import and_, or_

from aspen.database.models import Sample, User


def authz_sample_filters(query: Query, sample_ids: Set[str], user: User) -> Query:
    # No filters for system admins
    if user.system_admin:
        query = query.filter(
            or_(
                Sample.public_identifier.in_(sample_ids),
                Sample.private_identifier.in_(sample_ids),
            )
        )
        return query

    # Users can only see samples and private identifiers for their own group.
    cansee_groups: Set[int] = {user.group_id}
    cansee_groups_private_identifiers: Set[int] = {user.group_id}

    query = query.filter(
        or_(
            and_(
                Sample.submitting_group_id.in_(cansee_groups),
                Sample.public_identifier.in_(sample_ids),
            ),
            and_(
                Sample.submitting_group_id.in_(cansee_groups_private_identifiers),
                Sample.private_identifier.in_(sample_ids),
            ),
        )
    )
    query = query.filter(
        and_(or_(~Sample.private, Sample.submitting_group_id == user.group_id))
    )
    return query
