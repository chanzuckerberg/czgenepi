from typing import Iterable, Mapping, Set, Tuple

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.database.models import GisaidMetadata


async def get_matching_gisaid_ids(
    session: AsyncSession, sample_ids: Iterable[str]
) -> Set[str]:
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

    gisaid_matches_query = sa.select(GisaidMetadata).filter(  # type: ignore
        GisaidMetadata.strain.in_(stripped_mapping.keys())
    )
    gisaid_matches: Iterable[GisaidMetadata] = (
        await session.execute(gisaid_matches_query)
    ).scalars()
    for gisaid_match in gisaid_matches:
        # add back in originally submitted identifier (unstripped)
        gisaid_ids.add(stripped_mapping[gisaid_match.strain])

    return gisaid_ids


async def get_matching_gisaid_ids_by_epi_isl(
    session: AsyncSession, sample_ids: Iterable[str]
) -> Tuple[Set[str], Set[str]]:
    """
    Check if a list of identifiers exist as epi isl numbers.

    Parameters:
        sample_ids Iterable[str]: A list of identifiers (usually submitted by a user)
                                  that need to be checked if they exist as epi_isl identifiers
        session (Session): An open sql alchemy session

    Returns:
            epi_isls (Set[str]): Set of idenitifiers that matched against GisaidMetadata table

    """
    isl_matches_query = sa.select(GisaidMetadata).where(  # type: ignore
        GisaidMetadata.gisaid_epi_isl.in_(sample_ids)
    )
    isl_matches: Iterable[GisaidMetadata] = (
        (await session.execute(isl_matches_query)).scalars().all()
    )
    gisaid_ids = set()
    epi_isls = set()
    for match in isl_matches:
        gisaid_ids.add(match.strain)
        epi_isls.add(match.gisaid_epi_isl)
    return gisaid_ids, epi_isls
