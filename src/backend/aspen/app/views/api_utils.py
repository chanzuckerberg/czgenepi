import datetime
from collections import Counter
from typing import Any, Collection, Iterable, List, Mapping, Optional, Set, Tuple, Union

from sqlalchemy.orm import joinedload
from sqlalchemy.orm.query import Query
from sqlalchemy.orm.session import Session
from sqlalchemy.sql.expression import and_, or_

from aspen.database.models import (
    DataType,
    GisaidMetadata,
    Group,
    PhyloRun,
    PhyloTree,
    Sample,
    User,
)


def filter_usergroup_dict(
    unfiltered_dict: Mapping[str, Union[str, bool]],
    fields_to_keep: Collection[str],
) -> Mapping[str, Union[str, bool]]:
    return {k: v for k, v in unfiltered_dict.items() if k in fields_to_keep}


def get_usergroup_query(session: Session, user_id: str) -> Query:
    return (
        session.query(User)
        .options(joinedload(User.group).joinedload(Group.can_see))
        .filter(User.auth0_user_id == user_id)
    )


def format_date(dt: Optional[datetime.date], format="%Y-%m-%d") -> str:
    if dt is not None:
        return dt.strftime(format)
    else:
        return "N/A"


def format_datetime(dt: Optional[datetime.datetime], format="%Y-%m-%d %I:%M%p") -> str:
    if dt is not None:
        return dt.strftime(format)
    else:
        return "N/A"


def format_sequencing_date(dt: str, format="%Y-%m-%d") -> Optional[datetime.datetime]:
    if dt == "":
        return None
    return datetime.datetime.strptime(dt, format)


def get_all_identifiers_in_request(data: Mapping) -> Tuple[list[str], list[str]]:
    private_ids: list = []
    public_ids: list = []

    for d in data:
        private_ids.append(d["sample"]["private_identifier"])
        if "public_identifier" in d["sample"].keys():
            public_ids.append(d["sample"]["public_identifier"])

    return private_ids, public_ids


def get_existing_private_ids(
    private_ids: list[str], session: Session, group_id=None
) -> list[str]:
    samples = session.query(Sample).filter(Sample.private_identifier.in_(private_ids))

    if group_id is not None:
        samples = samples.filter(Sample.submitting_group_id == group_id)

    return [i.private_identifier for i in samples.all()]


def get_existing_public_ids(
    public_ids: list[str], session: Session, group_id=None
) -> list[str]:
    samples = session.query(Sample).filter(Sample.public_identifier.in_(public_ids))

    if group_id is not None:
        samples = samples.filter(Sample.submitting_group_id == group_id)

    return [i.public_identifier for i in samples.all()]


def check_duplicate_samples(
    data: Mapping,
    session: Session,
    group_id: Optional[int] = None,
) -> Optional[Mapping[str, list[str]]]:
    """
    Checks incoming `data` for duplicate private/public IDs of pre-existing IDs.

    If called with a `group_id` arg, limits to only searching for duplicates within
    the given group. If no group given, searches globally for duplicate IDs and will
    match against any ID in any group that is already existing.
    """
    private_ids, public_ids = get_all_identifiers_in_request(data)

    existing_private_ids: list[str] = get_existing_private_ids(
        private_ids, session, group_id
    )
    existing_public_ids: list[str] = get_existing_public_ids(
        public_ids, session, group_id
    )

    if existing_private_ids or existing_public_ids:
        return {
            "existing_private_ids": existing_private_ids,
            "existing_public_ids": existing_public_ids,
        }

    return None


def check_duplicate_data_in_request(
    data: Mapping,
) -> Optional[Mapping[str, list[str]]]:
    private_ids, public_ids = get_all_identifiers_in_request(data)
    private_id_counts = [id for id, count in Counter(private_ids).items() if count > 1]
    public_id_counts = [
        id for id, count in Counter(public_ids).items() if count > 1 and id != ""
    ]

    if private_id_counts or public_id_counts:
        return {
            "duplicate_private_ids": private_id_counts,
            "duplicate_public_ids": public_id_counts,
        }

    return None


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


def check_valid_sequence(sequence: str) -> bool:
    """
    Check that the sequence string only contains valid sequence characters
    """
    return set(sequence.upper()).issubset(set("WSKMYRVHDBNZNATCGU-"))


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

    # Which groups can this user query public identifiers for?
    cansee_groups: Set[int] = {
        cansee.owner_group_id
        for cansee in user.group.can_see
        if cansee.data_type == DataType.SEQUENCES
    }
    # add the user's own group
    cansee_groups.add(user.group_id)

    # Which groups can this user query private identifiers for?
    # NOTE - this asssumes PRIVATE_IDENTIFIERS permission is a superset of SEQUENCES
    cansee_groups_private_identifiers: Set[int] = {
        cansee.owner_group_id
        for cansee in user.group.can_see
        if cansee.data_type == DataType.PRIVATE_IDENTIFIERS
    }
    # add the user's own group
    cansee_groups_private_identifiers.add(user.group_id)

    cansee_groups.add(user.group_id)
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


# TODO, this is incredibly similar to sample authz filters. Generalize these!
def authz_phylo_tree_filters(query: Query, tree_ids: Set[int], user: User) -> Query:
    # No filters for system admins
    if user.system_admin:
        query = query.filter(
            PhyloTree.entity_id.in_(tree_ids),
        )
        return query

    # Which groups can this user query trees for?
    cansee_groups: Set[int] = {
        cansee.owner_group_id
        for cansee in user.group.can_see
        if cansee.data_type == DataType.TREES
    }
    # add the user's own group
    cansee_groups.add(user.group_id)

    query = query.filter(
        and_(
            PhyloRun.group_id.in_(cansee_groups),
            PhyloTree.entity_id.in_(tree_ids),
        ),
    )
    return query


def get_missing_and_found_sample_ids(
    sample_ids: Iterable[str], all_samples: Query
) -> Tuple[Set[str], Set[Any]]:
    """
    Check a list of sample identifiers against Sample table public and private identifiers

    Parameters:
        sample_ids Iterable[str]: A list of identifiers (usually submitted by a user)
                                  that need to be checked if they exist as either public
                                  or private identifiers in the aspen database Sample table
        all_samples (Query): Query consisting of all samples that a user has been allowed access to see.

    Returns:
            missing_sample_ids (Set[str]): Set of idenitifiers that did not match against any sample public or private identifiers
            found_sample_ids (Set[str]): Set of idenitifiers found as either public or private identifiers

    """
    found_sample_ids = set()
    for sample in all_samples:
        # Don't include failed samples in our list of potential matches!
        if sample.czb_failed_genome_recovery:
            continue
        found_sample_ids.add(sample.private_identifier)
        found_sample_ids.add(sample.public_identifier)

    # These are the sample ID's that don't match the aspen db
    missing_sample_ids = set(sample_ids) - found_sample_ids
    return missing_sample_ids, found_sample_ids


def get_matching_gisaid_ids(sample_ids: Iterable[str], session: Session) -> Set[str]:
    """
    Check if a list of identifiers exist as gisaid strain names,
    strip identifier (hCoV-19/) before proceeding with check against GisaidMetadata table

    Parameters:
        sample_ids Iterable[str]: A list of identifiers (usually submitted by a user)
                                  that need to be checked if they exist as gisaid identifiers ( as strain names)
        session (Session): An open sql alchemy session

    Returns:
            gisaid_ids (Set[str]): Set of idenitifiers that matched against GisaidMetadata table as strain names

    """

    gisaid_ids = set()

    # we need to strip off hCoV-19/ before checking against gisaid strain name
    # (Gisaid data is prepped by Nextstrain which strips off this prefix)

    # first create a mapping of ids that were stripped (so we can return unstripped id later)
    stripped_mapping: Mapping[str, str] = {
        (s.replace("hCoV-19/", "") if s.startswith("hCoV-19/") else s): s
        for s in sample_ids
    }

    gisaid_matches: Iterable[GisaidMetadata] = session.query(GisaidMetadata).filter(
        GisaidMetadata.strain.in_(stripped_mapping.keys())
    )
    for gisaid_match in gisaid_matches:
        # add back in originally submitted identifier (unstripped)
        gisaid_ids.add(stripped_mapping[gisaid_match.strain])

    return gisaid_ids
