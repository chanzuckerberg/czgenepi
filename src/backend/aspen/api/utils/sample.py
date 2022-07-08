from collections import Counter
from typing import Any, Dict, List, Mapping, Optional, Set, Tuple, TYPE_CHECKING

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.query import Query
from sqlalchemy.sql.expression import or_

from aspen.api.authz import AuthZSession
from aspen.database.models import Accession, AccessionType, Sample

if TYPE_CHECKING:
    from aspen.api.schemas.samples import CreateSampleRequest


async def samples_by_identifiers(
    az: AuthZSession, sample_ids: Optional[Set[str]], permission="read"
) -> Query:
    # TODO, this query can be updated to use an "id in (select id from...)" clause when we get a chance to fix it.
    public_samples_query = (
        (await az.authorized_query("read", Sample))
        .filter(Sample.public_identifier.in_(sample_ids))  # type: ignore
        .subquery()  # type: ignore
    )
    private_samples_query = (
        (await az.authorized_query("read_private", Sample))
        .filter(Sample.private_identifier.in_(sample_ids))  # type: ignore
        .subquery()  # type: ignore
    )
    query = (
        (await az.authorized_query(permission, Sample))
        .outerjoin(public_samples_query, Sample.id == public_samples_query.c.id)  # type: ignore
        .outerjoin(private_samples_query, Sample.id == private_samples_query.c.id)  # type: ignore
        .where(
            or_(
                public_samples_query.c.id != None,  # noqa: E711
                private_samples_query.c.id != None,  # noqa: E711
            )
        )
    )
    return query


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
