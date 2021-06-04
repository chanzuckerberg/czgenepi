import datetime
from typing import Collection, List, Mapping, Optional, Tuple, Union

from sqlalchemy.orm import joinedload
from sqlalchemy.orm.query import Query
from sqlalchemy.orm.session import Session

from aspen.database.models.usergroup import User


def filter_usergroup_dict(
    unfiltered_dict: Mapping[str, Union[str, bool]],
    fields_to_keep: Collection[str],
) -> Mapping[str, Union[str, bool]]:
    return {k: v for k, v in unfiltered_dict.items() if k in fields_to_keep}


def get_usergroup_query(session: Session, user_id: str) -> Query:
    return (
        session.query(User)
        .options(joinedload(User.group))
        .filter(User.auth0_user_id == user_id)
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


def check_data(
    sample_fields: list[str],
    pathogen_genome_fields: list[str],
    required_fields: tuple,
    optional_fields: tuple,
) -> Tuple[bool, List[str], List[str]]:

    combined_fields: list[str] = sample_fields + pathogen_genome_fields
    # check all required fields are present:
    missing_required: list[str] = [
        i for i in required_fields if i not in combined_fields
    ]

    # check no fields were added that are unexpected
    unexpected: list[str] = [
        i for i in combined_fields if i not in required_fields + optional_fields
    ]

    if missing_required or unexpected:
        return False, missing_required, unexpected

    # data is clean
    return True, [], []
