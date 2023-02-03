import re
from collections import Counter
from typing import (
    Any,
    Dict,
    List,
    Mapping,
    Optional,
    Sequence,
    Set,
    Tuple,
    TYPE_CHECKING,
)

import sentry_sdk
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.query import Query
from sqlalchemy.sql.expression import and_, or_

from aspen.api.authz import AuthZSession
from aspen.database.models import (
    Accession,
    AccessionType,
    Group,
    Location,
    Pathogen,
    PathogenRepoConfig,
    PublicRepository,
    Sample,
    User,
)

if TYPE_CHECKING:
    from aspen.api.schemas.samples import CreateSampleRequest


PREFIXES_TO_STRIP = ["hCoV-19/"]


def apply_pathogen_prefix_to_identifier(
    sample_identifier: str, pathogen_prefix: str
) -> str:
    sequence_name = sample_identifier
    prefix_to_strip: Optional[str] = None
    for prefix in PREFIXES_TO_STRIP:
        if sample_identifier.startswith(prefix):
            prefix_to_strip = prefix
    if prefix_to_strip:
        sequence_name = sequence_name.replace(prefix, "")
    # only add on new prefix if it's not there already
    if not sequence_name.startswith(pathogen_prefix):
        sequence_name = pathogen_prefix + "/" + sequence_name
    return sequence_name


async def get_public_repository_prefix(pathogen: Pathogen, public_repository_name, db):
    if public_repository_name:
        # only get the prefix if we have enough information to proceed
        prefix = (
            sa.select(PathogenRepoConfig)  # type: ignore
            .join(PublicRepository)  # type: ignore
            .where(  # type: ignore
                and_(
                    PathogenRepoConfig.pathogen == pathogen,
                    PublicRepository.name == public_repository_name,
                )
            )
        )
        res = await db.execute(prefix)
        pathogen_repo_config = res.scalars().one_or_none()
        if pathogen_repo_config:
            return pathogen_repo_config.prefix


async def samples_by_identifiers(
    az: AuthZSession,
    pathogen: Pathogen,
    sample_ids: Optional[Set[str]],
    permission="read",
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
            and_(
                Sample.pathogen == pathogen,  # noqa: E711
                or_(
                    public_samples_query.c.id != None,  # noqa: E711
                    private_samples_query.c.id != None,  # noqa: E711
                ),
            ),
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


def format_sample_lineage(sample: Sample) -> List[Dict[str, Any]]:
    pathogen = sample.pathogen
    lineage: Dict[str, Any] = {
        "scorpio_call": None,
        "scorpio_support": None,
        "qc_status": None,
    }

    lineages = []
    for lin in sample.lineages:
        lineage_response = lineage.copy()
        lineage_response["lineage"] = lin.lineage
        lineage_response["lineage_type"] = lin.lineage_type
        lineage_response["lineage_software_version"] = lin.lineage_software_version
        lineage_response["lineage_probability"] = lin.lineage_probability
        lineage_response["reference_dataset_name"] = lin.reference_dataset_name
        lineage_response[
            "reference_sequence_accession"
        ] = lin.reference_sequence_accession
        lineage_response["reference_dataset_tag"] = lin.reference_dataset_tag
        if sample.qc_metrics:
            lineage_response["qc_status"] = sample.qc_metrics[0].qc_status

        if pathogen.slug == "SC2":
            lineage_response["scorpio_call"] = lin.raw_lineage_output.get(
                "scorpio_call"
            )
            lineage_response["scorpio_support"] = lin.raw_lineage_output.get(
                "scorpio_support"
            )
            # For `last_updated`, only SC2 (via Pangolin) provides a non-null val.
            lineage_response["last_updated"] = lin.last_updated
        else:
            # Currently (Dec 2022), other pathogens get lineage via Nextclade.
            # In Nextclade, dataset `tag` is a datetime, so pull from that.
            lineage_response["last_updated"] = get_date_from_nextclade_tag(
                lin.reference_dataset_tag
            )

        lineages.append(lineage_response)

    return lineages


def get_date_from_nextclade_tag(reference_dataset_tag: str) -> Optional[str]:
    """Pulls out "YYYY-MM-DD" date from a Nextclade dataset's `tag` attribute.

    Nextclade attaches a `tag` to every dataset to uniquely identify it. This
    tag is consistently just a datetime (eg, "2021-06-25T00:00:00Z"), so we
    can extract the date from it. While Nextclade seems to strongly adhere to
    this convention for tags, there is no documentation that future tags /must/
    keep this structure. If they ever change it we'll need to alter how we
    handle capturing the date associated with a given dataset.
    """
    date = None  # default fall-through just in case tag is missing
    if reference_dataset_tag:
        m = re.match(r"^\d{4}-\d+-\d+(?=T)", reference_dataset_tag)
        # Should never happen, but if it does, we need to know about it!
        if m is None:
            msg = (
                f"Expected structure for Nextclade dataset `tag` was not "
                f"found, could not extract date. This likely means Nextclade "
                f"changed their tag structure. An engineer should investigate "
                f"since this impacts `last_updated` for Nextclade lineages. "
                f"Problem `reference_dataset_tag` was {reference_dataset_tag}."
            )
            sentry_sdk.capture_message(msg, "warning")
        else:
            date = m.group()
    return date


def collect_submission_information(
    user: User, group: Group, samples: Sequence[Sample]
) -> List[Dict[str, Any]]:
    submission_information: List[Dict[str, Any]] = []

    for sample in samples:
        sample_info = {}
        # (Vince): Pretty confident the `getattr` aspect is unnecessary now.
        # I was fixing an error MyPy found but don't have time to investigate,
        # so I'm leaving approach, which means `getattr` stays for now.
        sample_location: Optional[Location] = getattr(
            sample, "collection_location", None
        )
        if sample_location is None:
            sample_location = Location()
        sample_info = {
            "gisaid_submitter_id": user.gisaid_submitter_id,
            "public_identifier": sample.public_identifier,
            "collection_date": sample.collection_date,
            "submitting_lab": group.submitting_lab or group.name,
            "group_address": group.address,
            "region": sample_location.region,
            "country": sample_location.country,
            "division": sample_location.division,
            "location": sample_location.location,
        }
        submission_information.append(sample_info)

    return submission_information


def sample_info_to_gisaid_rows(
    submission_information: List[Dict[str, Any]], pathogen_prefix: str, today: str
) -> List[Dict[str, str]]:
    gisaid_metadata_rows = []
    for sample_info in submission_information:
        # Concat location information to a single string in Region / Country / Division / Location format
        location_strings = []
        for key in ["region", "country", "division", "location"]:
            if sample_info[key]:
                location_strings.append(sample_info[key])
            else:
                location_strings.append("None")
        gisaid_location = " / ".join(location_strings)

        metadata_row = {
            "submitter": sample_info["gisaid_submitter_id"],
            "fn": f"{today}_GISAID_sequences.fasta",
            "covv_virus_name": apply_pathogen_prefix_to_identifier(
                sample_info["public_identifier"], pathogen_prefix
            ),
            "covv_location": gisaid_location,
            "covv_collection_date": sample_info["collection_date"].strftime("%Y-%m-%d"),
            "covv_subm_lab": sample_info["submitting_lab"],
            "covv_subm_lab_addr": sample_info["group_address"],
        }
        gisaid_metadata_rows.append(metadata_row)
    return gisaid_metadata_rows


def sample_info_to_genbank_rows(
    submission_information: List[Dict[str, Any]],
    pathogen_prefix: str,
    pathogen_slug: str,
) -> List[Dict[str, str]]:
    genbank_metadata_rows = []
    for sample_info in submission_information:
        # Concat location information to a single string in Country: Division, Location format
        genbank_location = f"{sample_info['country']}: {sample_info['division']}, {sample_info['location']}"
        metadata_row = {
            "Sequence_ID": apply_pathogen_prefix_to_identifier(
                sample_info["public_identifier"], pathogen_prefix
            ),
            "collection-date": sample_info["collection_date"].strftime("%Y-%m-%d"),
            "country": genbank_location,
            "isolate": apply_pathogen_prefix_to_identifier(
                sample_info["public_identifier"], pathogen_prefix
            ),
        }
        if pathogen_slug == "SC2":
            metadata_row["isolation-source"] = "Nasal/oral swab"
        else:
            metadata_row["isolation-source"] = "clinical"
        genbank_metadata_rows.append(metadata_row)
    return genbank_metadata_rows
