from typing import Any, Iterable, Mapping, Set, Tuple

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.query import Query

from aspen.database.models import GisaidMetadata


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


async def get_matching_gisaid_ids(
    db: AsyncSession, sample_ids: Iterable[str]
) -> Set[str]:
    """
    Check if a list of identifiers exist as gisaid strain names,
    strip identifier (hCoV-19/) before proceeding with check against GisaidMetadata table

    Parameters:
        sample_ids Iterable[str]: A list of identifiers (usually submitted by a user)
                                  that need to be checked if they exist as gisaid identifiers ( as strain names)

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

    gisaid_query: Iterable[GisaidMetadata] = sa.select(GisaidMetadata).filter(
        GisaidMetadata.strain.in_(stripped_mapping.keys())
    )
    gisaid_matches = await db.execute(gisaid_query)
    for gisaid_match in gisaid_matches.scalars():
        # add back in originally submitted identifier (unstripped)
        gisaid_ids.add(stripped_mapping[gisaid_match.strain])

    return gisaid_ids
