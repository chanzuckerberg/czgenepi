import datetime
from typing import Collection, List, Mapping, Optional, Tuple, Union

from sqlalchemy.orm import joinedload
from sqlalchemy.orm.query import Query
from sqlalchemy.orm.session import Session

from aspen.database.models import Sample, User


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


def format_sequencing_date(dt: str, format="%Y-%m-%d") -> str:
    if dt == "":
        return None
    return datetime.datetime.strptime(dt, format)


def check_duplicate_samples(data: Mapping, session):
    private_ids = []
    public_ids = []

    for d in data:
        private_ids.append(d["sample"]["private_identifier"])
        if "public_identifier" in d["sample"].keys():
            public_ids.append(d["sample"]["public_identifier"])

    existing_private_ids = [
        i.private_identifier
        for i in session.query(Sample)
        .filter(Sample.private_identifier.in_(private_ids))
        .all()
    ]
    existing_public_ids = [
        i.public_identifier
        for i in session.query(Sample)
        .filter(Sample.public_identifier.in_(public_ids))
        .all()
    ]

    if existing_private_ids or existing_public_ids:
        return {
            "existing_private_ids": existing_private_ids,
            "existing_public_ids": existing_public_ids,
        }


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
