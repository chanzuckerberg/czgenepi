from typing import Iterable, Mapping, Set, Tuple

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.database.models import Pathogen, PublicRepository, PublicRepositoryMetadata


async def get_matching_repo_ids(
    session: AsyncSession,
    pathogen: Pathogen,
    repository: PublicRepository,
    sample_ids: Iterable[str],
) -> Set[str]:
    """
    Check if a list of identifiers exist as public repository strain names,
    strip identifier (hCoV-19/) before proceeding with check against PublicRepositoryMetadata table

    Parameters:
        sample_ids Iterable[str]: A list of identifiers (usually submitted by a user)
                                  that need to be checked if they exist as public repository identifiers ( as strain names)
        session (Session): An open sql alchemy session

    Returns:
            repo_ids (Set[str]): Set of idenitifiers that matched against PublicRepositoryMetadata table as strain names

    """

    repo_ids = set()

    # we need to strip off hCoV-19/ before checking against public repo strain name
    # (public repo data is prepped by Nextstrain which strips off this prefix)

    # first create a mapping of ids that were stripped (so we can return unstripped id later)
    stripped_mapping: Mapping[str, str] = {
        (s.replace("hCoV-19/", "") if s.startswith("hCoV-19/") else s): s
        for s in sample_ids
    }

    repo_matches_query = sa.select(PublicRepositoryMetadata).filter(  # type: ignore
        PublicRepositoryMetadata.public_repository == repository,
        PublicRepositoryMetadata.pathogen == pathogen,
        PublicRepositoryMetadata.strain.in_(stripped_mapping.keys()),
    )
    repo_matches: Iterable[PublicRepositoryMetadata] = (
        await session.execute(repo_matches_query)
    ).scalars()
    for repo_match in repo_matches:
        # add back in originally submitted identifier (unstripped)
        repo_ids.add(stripped_mapping[repo_match.strain])

    return repo_ids


async def get_matching_repo_ids_by_epi_isl(
    session: AsyncSession,
    pathogen: Pathogen,
    repository: PublicRepository,
    sample_ids: Iterable[str],
) -> Tuple[Set[str], Set[str]]:
    """
    Check if a list of identifiers exist as epi isl numbers.

    Parameters:
        sample_ids Iterable[str]: A list of identifiers (usually submitted by a user)
                                  that need to be checked if they exist as epi_isl identifiers
        session (Session): An open sql alchemy session

    Returns:
            epi_isls (Set[str]): Set of idenitifiers that matched against PublicRepositoryMetadata table

    """
    isl_matches_query = sa.select(PublicRepositoryMetadata).where(  # type: ignore
        PublicRepositoryMetadata.public_repository == repository,
        PublicRepositoryMetadata.pathogen == pathogen,
        PublicRepositoryMetadata.isl.in_(sample_ids),
    )
    isl_matches: Iterable[PublicRepositoryMetadata] = (
        (await session.execute(isl_matches_query)).scalars().all()
    )
    repo_ids = set()
    epi_isls = set()
    for match in isl_matches:
        repo_ids.add(match.strain)
        epi_isls.add(match.isl)
    return repo_ids, epi_isls
