from collections import Counter
from typing import (
    Any,
    Dict,
    Iterable,
    List,
    Mapping,
    Optional,
    Set,
    Tuple,
    TYPE_CHECKING,
)

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.database.models import Accession, AccessionType, GisaidMetadata, Sample

if TYPE_CHECKING:
    from aspen.api.schemas.samples import CreateSampleRequest


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


def get_all_identifiers_in_request(
    data: List["CreateSampleRequest"],
) -> Tuple[list[str], list[str]]:
    private_ids: list = []
    public_ids: list = []

    for d in data:
        private_ids.append(d.sample.private_identifier)
        if d.sample.public_identifier:
            public_ids.append(d.sample.public_identifier)

    return private_ids, public_ids


async def get_existing_private_ids(
    private_ids: list[str], session: AsyncSession, group_id=None
) -> list[str]:
    samples = sa.select(Sample).filter(Sample.private_identifier.in_(private_ids))  # type: ignore

    if group_id is not None:
        samples = samples.filter(Sample.submitting_group_id == group_id)

    res = await session.execute(samples)
    return [i.private_identifier for i in res.scalars().all()]


async def get_existing_public_ids(
    public_ids: list[str], session: AsyncSession, group_id=None
) -> list[str]:
    samples = sa.select(Sample).filter(Sample.public_identifier.in_(public_ids))  # type: ignore

    if group_id is not None:
        samples = samples.filter(Sample.submitting_group_id == group_id)

    res = await session.execute(samples)
    return [i.public_identifier for i in res.scalars().all()]


async def check_duplicate_samples(
    data: List["CreateSampleRequest"],
    session: AsyncSession,
    group_id: Optional[int] = None,
) -> Optional[Mapping[str, list[str]]]:
    """
    Checks incoming `data` for duplicate private/public IDs of pre-existing IDs.

    If called with a `group_id` arg, limits to only searching for duplicates within
    the given group. If no group given, searches globally for duplicate IDs and will
    match against any ID in any group that is already existing.
    """
    private_ids, public_ids = get_all_identifiers_in_request(data)

    existing_private_ids: list[str] = await get_existing_private_ids(
        private_ids, session, group_id
    )
    existing_public_ids: list[str] = await get_existing_public_ids(
        public_ids, session, group_id
    )

    if existing_private_ids or existing_public_ids:
        return {
            "existing_private_ids": existing_private_ids,
            "existing_public_ids": existing_public_ids,
        }

    return None


def check_duplicate_samples_in_request(
    data: List["CreateSampleRequest"],
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


def determine_gisaid_status(
    sample: Sample,
) -> Mapping[str, Optional[str]]:
    if sample.czb_failed_genome_recovery:
        return {"status": "Not Eligible", "gisaid_id": None}

    gisaid_accession: Optional[Accession] = None
    for accession in sample.accessions:
        if accession.accession_type == AccessionType.GISAID_ISL:
            gisaid_accession = accession
            break

    if gisaid_accession:
        return {
            "status": "Accepted",
            "gisaid_id": gisaid_accession.accession,
        }

    return {"status": "Not Found", "gisaid_id": None}


def format_sample_lineage(sample: Sample) -> Dict[str, Any]:
    pathogen_genome = sample.uploaded_pathogen_genome
    lineage: Dict[str, Any] = {
        "lineage": None,
        "confidence": None,
        "version": None,
        "last_updated": None,
        "scorpio_call": None,
        "scorpio_support": None,
        "qc_status": None,
    }
    if pathogen_genome:
        lineage["lineage"] = pathogen_genome.pangolin_lineage
        lineage["confidence"] = pathogen_genome.pangolin_probability
        lineage["version"] = pathogen_genome.pangolin_version
        lineage["last_updated"] = pathogen_genome.pangolin_last_updated

        # Support looking at pango csv output.
        pango_output: Dict[str, Any] = pathogen_genome.pangolin_output  # type: ignore
        lineage["scorpio_call"] = pango_output.get("scorpio_call")
        lineage["qc_status"] = pango_output.get("qc_status")
        if pango_output.get("scorpio_support"):
            lineage["scorpio_support"] = float(pango_output.get("scorpio_support"))  # type: ignore

    return lineage
