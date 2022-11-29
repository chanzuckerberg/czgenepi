import datetime
import threading
from typing import Any, List, Mapping, MutableSequence, Optional, Set, Type, Union

import sentry_sdk
import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncResult, AsyncSession
from sqlalchemy.orm import joinedload, selectinload
from sqlalchemy.orm.exc import NoResultFound

from aspen.api.authn import AuthContext, get_auth_context, get_auth_user
from aspen.api.authz import AuthZSession, get_authz_session, require_group_privilege
from aspen.api.deps import get_db, get_pathogen, get_public_repository, get_settings
from aspen.api.error import http_exceptions as ex
from aspen.api.schemas.samples import (
    CreateSampleRequest,
    SampleBulkDeleteRequest,
    SampleBulkDeleteResponse,
    SampleDeleteResponse,
    SampleResponse,
    SamplesResponse,
    SubmissionTemplateRequest,
    UpdateSamplesRequest,
    ValidateIDsRequest,
    ValidateIDsResponse,
)
from aspen.api.settings import APISettings
from aspen.api.utils import (
    check_duplicate_samples,
    check_duplicate_samples_in_request,
    collect_submission_information,
    determine_gisaid_status,
    GenBankSubmissionFormTSVStreamer,
    get_matching_repo_ids,
    get_matching_repo_ids_by_epi_isl,
    get_missing_and_found_sample_ids,
    GisaidSubmissionFormCSVStreamer,
    sample_info_to_genbank_rows,
    sample_info_to_gisaid_rows,
    samples_by_identifiers,
)
from aspen.api.utils.pathogens import get_pathogen_repo_config_for_pathogen
from aspen.database.models import (
    Group,
    Location,
    Pathogen,
    PublicRepository,
    Sample,
    UploadedPathogenGenome,
    User,
)
from aspen.util.swipe import PangolinJob

router = APIRouter()

GISAID_REJECTION_TIME = datetime.timedelta(days=4)


@router.get("/", response_model=SamplesResponse)
async def list_samples(
    db: AsyncSession = Depends(get_db),
    az: AuthZSession = Depends(get_authz_session),
    ac: AuthContext = Depends(get_auth_context),
    pathogen: Pathogen = Depends(get_pathogen),
) -> SamplesResponse:

    # load the samples.
    user_visible_samples_query = await az.authorized_query("read", Sample)
    user_visible_samples_query = user_visible_samples_query.options(  # type: ignore
        selectinload(Sample.uploaded_pathogen_genome),
        selectinload(Sample.submitting_group),
        selectinload(Sample.uploaded_by),
        selectinload(Sample.collection_location),
        selectinload(Sample.accessions),
        selectinload(Sample.pathogen),
    )
    user_visible_samples_query = user_visible_samples_query.filter(
        Sample.pathogen_id == pathogen.id
    )
    user_visible_samples_result = await db.execute(user_visible_samples_query)
    user_visible_samples: List[Sample] = (
        user_visible_samples_result.unique().scalars().all()
    )

    # populate sample object using pydantic response schema
    result = SamplesResponse(samples=[])
    tot_rows = 0
    for sample in user_visible_samples:
        tot_rows += 1
        sample.gisaid = determine_gisaid_status(
            sample,
        )
        sample.show_private_identifier = False
        # TODO - convert this to an oso check.
        if sample.submitting_group_id == ac.group.id:  # type: ignore
            sample.show_private_identifier = True

        sampleinfo = SampleResponse.from_orm(sample)
        result.samples.append(sampleinfo)
    return result


async def get_write_samples_by_ids(
    db: AsyncSession, az: AuthZSession, sample_ids: List[int]
) -> AsyncResult:
    query = await az.authorized_query("write", Sample)
    query = query.options(
        joinedload(Sample.uploaded_pathogen_genome),
        joinedload(Sample.submitting_group),
        joinedload(Sample.uploaded_by),
        joinedload(Sample.collection_location),
        joinedload(Sample.pathogen),
    ).filter(
        Sample.id.in_(sample_ids)
    )  # type: ignore
    results = await db.execute(query)
    return results.scalars()


@router.delete("/", responses={200: {"model": SampleBulkDeleteResponse}})
async def delete_samples(
    sample_info: SampleBulkDeleteRequest,
    db: AsyncSession = Depends(get_db),
    az: AuthZSession = Depends(get_authz_session),
) -> SampleDeleteResponse:
    # Make sure this sample exists and is delete-able by the current user.
    samples_res = await get_write_samples_by_ids(db, az, sample_info.ids)
    samples = samples_res.all()
    if len(samples) != len(sample_info.ids):
        raise ex.NotFoundException("samples not found")

    db_ids = []
    for sample in samples:
        db_ids.append(sample.id)
        await db.delete(sample)

    await db.commit()
    return SampleBulkDeleteResponse(ids=db_ids)


@router.delete("/{sample_id}", responses={200: {"model": SampleDeleteResponse}})
async def delete_sample(
    sample_id: int,
    db: AsyncSession = Depends(get_db),
    az: AuthZSession = Depends(get_authz_session),
) -> SampleDeleteResponse:
    # Make sure this sample exists and is delete-able by the current user.
    sample_db_res = await get_write_samples_by_ids(db, az, [sample_id])
    try:
        sample = sample_db_res.one()
    except NoResultFound:
        raise ex.NotFoundException("sample not found")

    sample_db_id = sample.id
    await db.delete(sample)
    await db.commit()
    return SampleDeleteResponse(id=sample_db_id)


@router.put("/", response_model=SamplesResponse)
async def update_samples(
    update_samples_request: UpdateSamplesRequest,
    db: AsyncSession = Depends(get_db),
    az: AuthZSession = Depends(get_authz_session),
) -> SamplesResponse:

    # reorganize request data to make it easier to update
    reorganized_request_data = {s.id: s for s in update_samples_request.samples}
    sample_ids_to_update = list(reorganized_request_data.keys())

    # Make sure these samples exist and are delete-able by the current user.
    sample_db_res = await get_write_samples_by_ids(db, az, sample_ids_to_update)
    editable_samples: MutableSequence[Sample] = sample_db_res.all()

    # are there any samples that can't be updated?
    uneditable_samples = [
        s for s in sample_ids_to_update if s not in [i.id for i in editable_samples]
    ]
    if uneditable_samples:
        raise ex.NotFoundException("some samples cannot be updated")

    res = SamplesResponse(samples=[])
    for sample in editable_samples:
        update_data = reorganized_request_data[sample.id]
        for key, value in update_data:
            if key in ["collection_location", "sequencing_date"]:
                continue
            setattr(sample, key, value)
        # Location id is handled specially
        if update_data.collection_location:
            loc = await db.get(Location, update_data.collection_location)
            if not loc:
                raise ex.BadRequestException("location is invalid")
            sample.collection_location = loc

        # Sequencing date is handled specially
        sample.uploaded_pathogen_genome.sequencing_date = update_data.sequencing_date  # type: ignore
        # workaround for our response serializer
        sample.show_private_identifier = True

        sample.generate_public_identifier(already_exists=True)
        res.samples.append(SampleResponse.from_orm(sample))

    try:
        await db.commit()
    except IntegrityError:
        # We're relying on Posgres' group+private_id and group+public_id uniqueness
        # constraints to check whether we have duplicate identifiers.
        raise ex.BadRequestException(
            "All private and public identifiers must be unique"
        )

    return res


@router.post("/validate_ids/", response_model=ValidateIDsResponse)
async def validate_ids(
    request_data: ValidateIDsRequest,
    db: AsyncSession = Depends(get_db),
    az: AuthZSession = Depends(get_authz_session),
    pathogen: Pathogen = Depends(get_pathogen),
    public_repository: PublicRepository = Depends(get_public_repository),
) -> ValidateIDsResponse:

    """
    take in a list of identifiers and checks if all identifiers exist as either Sample public or private identifiers, or PublicRepositoryMetadata strain names

    returns a response with list of missing identifiers if any, otherwise will return an empty list
    """

    sample_ids: Set[str] = {item for item in request_data.sample_ids}

    # get all samples from request that the user has permission to use and scope down
    # the search for matching ID's to groups that the user has read access to.
    user_visible_samples_query = await samples_by_identifiers(az, pathogen, sample_ids)
    user_visible_samples_res = await (db.execute(user_visible_samples_query))
    user_visible_samples = user_visible_samples_res.scalars().all()

    # Are there any sample ID's that don't match sample table public and private identifiers
    missing_sample_ids, _ = get_missing_and_found_sample_ids(
        sample_ids, user_visible_samples
    )

    # See if these missing_sample_ids match any Gisaid identifiers
    gisaid_ids: Set[str] = await get_matching_repo_ids(
        db, pathogen, public_repository, missing_sample_ids
    )

    # Do we have any samples that are not aspen private or public identifiers or gisaid identifiers?
    missing_sample_ids -= gisaid_ids

    # Do the same, but for epi isls
    epi_isls: Set[str]
    _, epi_isls = await get_matching_repo_ids_by_epi_isl(
        db, pathogen, public_repository, missing_sample_ids
    )
    missing_sample_ids -= epi_isls

    return ValidateIDsResponse(missing_sample_ids=missing_sample_ids)


@router.post("/", response_model=SamplesResponse)
async def create_samples(
    create_samples_request: List[CreateSampleRequest],
    db: AsyncSession = Depends(get_db),
    settings: APISettings = Depends(get_settings),
    user: User = Depends(get_auth_user),
    group: Group = Depends(require_group_privilege("create_sample")),
    pathogen: Pathogen = Depends(get_pathogen),
) -> SamplesResponse:

    duplicates_in_request: Union[
        None, Mapping[str, list[str]]
    ] = check_duplicate_samples_in_request(create_samples_request)
    if duplicates_in_request:
        raise ex.BadRequestException(
            f"Error processing data, either duplicate private_identifiers: {duplicates_in_request['duplicate_private_ids']} or duplicate public identifiers: {duplicates_in_request['duplicate_public_ids']} exist in the upload files, please rename duplicates before proceeding with upload.",
        )

    already_exists: Union[
        None, Mapping[str, list[str]]
    ] = await check_duplicate_samples(create_samples_request, db, group.id)
    if already_exists:
        raise ex.BadRequestException(
            f"Error inserting data, private_identifiers {already_exists['existing_private_ids']} or public_identifiers: {already_exists['existing_public_ids']} already exist in our database, please remove these samples before proceeding with upload.",
        )

    created_samples = []
    for row in create_samples_request:
        sample_input = row.sample
        pathogen_genome_input = row.pathogen_genome

        valid_location: Optional[Location] = await Location.get_by_id(
            db, sample_input.location_id
        )
        if not valid_location:
            sentry_sdk.capture_message(
                f"No valid location for id {sample_input.location_id}"
            )
            raise ex.BadRequestException("Invalid location id for sample")

        sample_args: Mapping[str, Any] = {
            "submitting_group": group,
            "uploaded_by": user,
            "sample_collected_by": group.name,
            "sample_collector_contact_address": group.address,
            "organism": sample_input.organism,
            "private_identifier": sample_input.private_identifier,
            "collection_date": sample_input.collection_date,
            "private": sample_input.private,
            "public_identifier": sample_input.public_identifier,
            "authors": sample_input.authors or [group.name],
            "collection_location": valid_location,
            "pathogen": pathogen,
        }

        sample: Sample = Sample(**sample_args)
        sample.generate_public_identifier()
        uploaded_pathogen_genome: UploadedPathogenGenome = UploadedPathogenGenome(
            sample=sample,
            sequence=pathogen_genome_input.sequence,
            sequencing_date=pathogen_genome_input.sequencing_date,
        )
        db.add(sample)
        db.add(uploaded_pathogen_genome)
        created_samples.append(sample)

    # Write all of our rows to the DB inside our transaction
    await db.flush()

    # Read the samples back from the DB with all fields populated.
    new_samples_query = (
        sa.select(Sample)  # type: ignore
        .options(  # type: ignore
            selectinload(Sample.uploaded_pathogen_genome),
            selectinload(Sample.submitting_group),
            selectinload(Sample.uploaded_by),
            selectinload(Sample.collection_location),
            selectinload(Sample.accessions),
        )
        .filter(Sample.id.in_([sample.id for sample in created_samples]))
        .execution_options(populate_existing=True)
    )
    res = await db.execute(new_samples_query)

    pangolin_sample_ids = []
    result = SamplesResponse(samples=[])
    for sample in res.unique().scalars().all():
        pangolin_sample_ids.append(sample.public_identifier)
        sample.gisaid = determine_gisaid_status(
            sample,
        )
        sample.show_private_identifier = True
        sampleinfo = SampleResponse.from_orm(sample)
        result.samples.append(sampleinfo)

    await db.commit()

    job = PangolinJob(settings)
    pangolin_job = threading.Thread(
        target=job.run,
        args=(group, pangolin_sample_ids),
    )
    pangolin_job.start()

    return result


def get_submission_template_filename(public_repository_name):
    # get filename depending on public_repository
    todays_date = datetime.date.today().strftime("%Y%m%d")
    return f"{todays_date}_{public_repository_name}_metadata.tsv"


@router.post("/submission_template")
async def fill_submission_template(
    request: SubmissionTemplateRequest,
    db: AsyncSession = Depends(get_db),
    az: AuthZSession = Depends(get_authz_session),
    ac: AuthContext = Depends(get_auth_context),
    pathogen: Pathogen = Depends(get_pathogen),
):
    sample_ids: Set[str] = {item for item in request.sample_ids}

    # get all samples from request that the user has permission to use and scope down
    # the search for matching ID's to groups that the user has read access to.
    user_visible_samples_query = await samples_by_identifiers(az, pathogen, sample_ids)
    user_visible_samples_res = await (
        db.execute(
            user_visible_samples_query.options(selectinload(Sample.collection_location))
        )
    )
    user_visible_samples = user_visible_samples_res.scalars().all()

    # get the sample id prefix for given public_repository
    pathogen_repo_config = await get_pathogen_repo_config_for_pathogen(
        pathogen, request.public_repository_name, db
    )

    prefix_should_exist = (
        pathogen is not None and request.public_repository_name is not None
    )
    if pathogen_repo_config.prefix is None and prefix_should_exist:
        raise ex.ServerException(
            "no prefix found for given pathogen_slug and public_repository combination"
        )

    if not ac.group:
        raise ex.ServerException("No group for user.")

    submission_information = collect_submission_information(
        ac.user, ac.group, user_visible_samples
    )

    # Affix GISAID prefixes to public ids and translate to GISAID fields
    metadata_rows: list[dict[str, str]] = []
    filename: str = ""
    tsv_streamer: Union[
        Type[GisaidSubmissionFormCSVStreamer], Type[GenBankSubmissionFormTSVStreamer]
    ]
    if request.public_repository_name.lower() == "gisaid":
        metadata_rows = sample_info_to_gisaid_rows(
            submission_information,
            pathogen_repo_config.prefix,
            datetime.date.today().strftime("%Y%m%d"),
        )
        metadata_rows.sort(key=lambda row: row.get("covv_virus_name"))  # type: ignore
        filename = get_submission_template_filename("GISAID")
        filename = filename.replace(".tsv", ".csv")
        tsv_streamer = GisaidSubmissionFormCSVStreamer
    elif request.public_repository_name.lower() == "genbank":
        metadata_rows = sample_info_to_genbank_rows(
            submission_information, pathogen_repo_config.prefix, pathogen.slug
        )
        metadata_rows.sort(key=lambda row: row.get("Sequence_ID"))  # type: ignore
        filename = get_submission_template_filename("GenBank")
        tsv_streamer = GenBankSubmissionFormTSVStreamer

    file_streamer = tsv_streamer(filename, metadata_rows)
    return file_streamer.get_response()
