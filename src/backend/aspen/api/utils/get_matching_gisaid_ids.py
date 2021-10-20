from aspen.database.models import GisaidMetadata
from typing import Iterable, Mapping, Set
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

import sqlalchemy as sa

async def get_matching_gisaid_ids(sample_ids: Iterable[str], session: AsyncSession) -> Set[str]:
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
    stripped_mapping: Mapping[str, str] = {s.strip("hCoV-19/"): s for s in sample_ids}

    gisaid_matches_query = sa.select(GisaidMetadata).filter(
        GisaidMetadata.strain.in_(stripped_mapping.keys())
    )
    gisaid_matches: Iterable[GisaidMetadata] = await session.execute(gisaid_matches_query)
    for gisaid_match in gisaid_matches:
        # add back in originally submitted identifier (unstripped)
        gisaid_ids.add(stripped_mapping[gisaid_match.strain])

    return gisaid_ids