from typing import Any, Iterable, Set, Tuple

from sqlalchemy.orm.query import Query


def get_missing_and_found_sample_ids(
    sample_ids: Iterable[str], all_samples: Query
) -> Tuple[Set[str], Set[Any]]:
    """
    Check a list of sample identifiers against Sample table public and private identifiers

    Parameters:
        sample_ids Iterable[str]: A list of identifiers (usually submitted by a user)
                                  that need to be checked if they exist as either public
                                  or private identifiers in the CZ GEN EPI database Sample table
        all_samples (Query): Query consisting of all samples that a user has been allowed access to see.

    Returns:
            missing_sample_ids (Set[str]): Set of idenitifiers that did not match against any sample public or private identifiers
            found_sample_ids (Set[str]): Set of idenitifiers found as either public or private identifiers

    """
    found_sample_ids = set()
    for sample in all_samples:
        found_sample_ids.add(sample.private_identifier)
        found_sample_ids.add(sample.public_identifier)

    # These are the sample ID's that don't match the CZ GEN EPI db
    missing_sample_ids = set(sample_ids) - found_sample_ids
    return missing_sample_ids, found_sample_ids
