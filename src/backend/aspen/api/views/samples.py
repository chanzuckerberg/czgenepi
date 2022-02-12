import datetime
from typing import List, Set

import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncResult, AsyncSession
from sqlalchemy.orm import joinedload, selectinload
from sqlalchemy.orm.exc import NoResultFound
from starlette.requests import Request

from aspen.api.auth import get_auth_user
from aspen.api.deps import get_db, get_settings, get_splitio
from aspen.api.error import http_exceptions as ex
from aspen.api.schemas.samples import (
    SampleBulkDeleteRequest,
    SampleBulkDeleteResponse,
    SampleDeleteResponse,
    SampleResponseSchema,
    SamplesResponseSchema,
    UpdateSamplesRequest,
    ValidateIDsRequestSchema,
    ValidateIDsResponseSchema,
)
from aspen.api.settings import Settings
from aspen.api.utils import (
    authz_samples_cansee,
    determine_gisaid_status,
    get_matching_gisaid_ids,
    get_missing_and_found_sample_ids,
)
from aspen.database.models import DataType, Location, Sample, User
from aspen.util.split import SplitClient

router = APIRouter()

GISAID_REJECTION_TIME = datetime.timedelta(days=4)


@router.get("/")
async def list_samples(
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    splitio: SplitClient = Depends(get_splitio),
    user: User = Depends(get_auth_user),
) -> SamplesResponseSchema:

    cansee_groups_private_identifiers: Set[int] = {
        cansee.owner_group_id
        for cansee in user.group.can_see
        if cansee.data_type == DataType.PRIVATE_IDENTIFIERS
    }

    # load the samples.
    all_samples_query = sa.select(Sample).options(  # type: ignore
        selectinload(Sample.uploaded_pathogen_genome),
        selectinload(Sample.submitting_group),
        selectinload(Sample.uploaded_by),
        selectinload(Sample.collection_location),
        selectinload(Sample.accessions),
    )
    user_visible_samples_query = authz_samples_cansee(all_samples_query, None, user)
    user_visible_samples_result = await db.execute(user_visible_samples_query)
    user_visible_samples: List[Sample] = (
        user_visible_samples_result.unique().scalars().all()
    )

    # populate sample object using pydantic response schema
    result = SamplesResponseSchema(samples=[])
    for sample in user_visible_samples:
        sample.gisaid = determine_gisaid_status(
            sample,
        )
        sample.show_private_identifier = False
        if (
            sample.submitting_group_id == user.group_id
            or sample.submitting_group_id in cansee_groups_private_identifiers
            or user.system_admin
        ):
            sample.show_private_identifier = True

        sampleinfo = SampleResponseSchema.from_orm(sample)
        result.samples.append(sampleinfo)
    return result


async def get_owned_samples_by_ids(
    db: AsyncSession, sample_ids: List[int], user: User
) -> AsyncResult:
    query = (
        sa.select(Sample)  # type: ignore
        .options(
            joinedload(Sample.uploaded_pathogen_genome),
            joinedload(Sample.submitting_group),
            joinedload(Sample.uploaded_by),
            joinedload(Sample.collection_location),
        )
        .filter(  # type: ignore
            sa.and_(
                Sample.submitting_group
                == user.group,  # This is an access control check!
                Sample.id.in_(sample_ids),
            )
        )
    )
    results = await db.execute(query)
    return results.scalars()


@router.delete("/")
async def delete_samples(
    sample_info: SampleBulkDeleteRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
) -> SampleDeleteResponse:
    # Make sure this sample exists and is delete-able by the current user.
    samples_res = await get_owned_samples_by_ids(db, sample_info.ids, user)
    samples = samples_res.all()
    if len(samples) != len(sample_info.ids):
        raise ex.NotFoundException("samples not found")

    db_ids = []
    for sample in samples:
        db_ids.append(sample.id)
        await db.delete(sample)

    await db.commit()
    return SampleBulkDeleteResponse(ids=db_ids)


@router.delete("/{sample_id}")
async def delete_sample(
    sample_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
) -> SampleDeleteResponse:
    # Make sure this sample exists and is delete-able by the current user.
    sample_db_res = await get_owned_samples_by_ids(db, [sample_id], user)
    try:
        sample = sample_db_res.one()
    except NoResultFound:
        raise ex.NotFoundException("sample not found")

    sample_db_id = sample.id
    await db.delete(sample)
    await db.commit()
    return SampleDeleteResponse(id=sample_db_id)


@router.put("/")
async def update_samples(
    update_samples_request: UpdateSamplesRequest,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
) -> SamplesResponseSchema:

    # reorganize request data to make it easier to update
    reorganized_request_data = {s.id: s for s in update_samples_request.samples}
    sample_ids_to_update = list(reorganized_request_data.keys())

    # Make sure these samples exist and are delete-able by the current user.
    sample_db_res = await get_owned_samples_by_ids(db, sample_ids_to_update, user)
    editable_samples = sample_db_res.all()

    # are there any samples that can't be updated?
    uneditable_samples = [
        s for s in sample_ids_to_update if s not in [i.id for i in editable_samples]
    ]
    if uneditable_samples:
        raise ex.NotFoundException("some samples cannot be updated")

    res = SamplesResponseSchema(samples=[])
    for sample in editable_samples:
        update_data = reorganized_request_data[sample.id]
        for key, value in update_data:
            if key in ["collection_location", "sequencing_date"]:
                continue
            if value is not None:  # We need to be able to set private to False!
                setattr(sample, key, value)
        # Location id is handled specially
        if update_data.collection_location:
            loc = await db.get(Location, update_data.collection_location)
            if not loc:
                raise ex.BadRequestException("location is invalid")
            sample.collection_location = loc
        # Sequencing date is handled specially
        if update_data.sequencing_date:
            sample.uploaded_pathogen_genome.sequencing_date = (
                update_data.sequencing_date
            )
        sample.show_private_identifier = True
        res.samples.append(SampleResponseSchema.from_orm(sample))

    try:
        await db.commit()
    except IntegrityError:
        # We're relying on Posgres' group+private_id and group+public_id uniqueness
        # constraints to check whether we have duplicate identifiers.
        raise ex.BadRequestException(
            "All private and public identifiers must be unique"
        )

    return res


@router.post("/validate_ids/")
async def validate_ids(
    request_data: ValidateIDsRequestSchema,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
) -> ValidateIDsResponseSchema:

    """
    take in a list of identifiers and checks if all idenitifiers exist as either Sample public or private identifiers, or GisaidMetadata strain names

    returns a response with list of missing identifiers if any, otherwise will return an empty list
    """

    sample_ids: Set[str] = {item for item in request_data.sample_ids}

    all_samples_query = sa.select(Sample).options()  # type: ignore

    # get all samples from request that the user has permission to use and scope down
    # the search for matching ID's to groups that the user has read access to.
    user_visible_samples_query = authz_samples_cansee(
        all_samples_query, sample_ids, user
    )
    user_visible_samples_res = await (db.execute(user_visible_samples_query))
    user_visible_samples = user_visible_samples_res.scalars().all()

    # Are there any sample ID's that don't match sample table public and private identifiers
    missing_sample_ids, _ = get_missing_and_found_sample_ids(
        sample_ids, user_visible_samples
    )

    # See if these missing_sample_ids match any Gisaid identifiers
    gisaid_ids: Set[str] = await get_matching_gisaid_ids(db, missing_sample_ids)

    # Do we have any samples that are not aspen private or public identifiers or gisaid identifiers?
    missing_sample_ids -= gisaid_ids

    return ValidateIDsResponseSchema(missing_sample_ids=missing_sample_ids)
