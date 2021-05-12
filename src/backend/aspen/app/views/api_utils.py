import datetime
from typing import Optional

from sqlalchemy.orm import joinedload, load_only
from sqlalchemy.orm.query import Query
from sqlalchemy.orm.session import Session

from aspen.database.models.usergroup import User, Group


def get_usergroup_query(session: Session, user_id: str) -> Query:
    return (
        session.query(User)
            .options(
            load_only("auth0_user_id", "agreed_to_tos"),
            joinedload(User.group).load_only("name")
        ).filter(User.auth0_user_id == user_id)
    )


def format_date(dt: datetime.date, format="%Y-%m-%d") -> str:
    if dt is not None:
        return dt.strftime(format)
    else:
        return "N/A"


def format_datetime(dt: Optional[datetime.datetime], format="%Y-%m-%d %I:%M%p") -> str:
    if dt is not None:
        return dt.strftime(format)
    else:
        return "N/A"
