import datetime
from typing import Any, Dict, List, Mapping, MutableSequence, NamedTuple, Optional, Set

import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.orm.exc import NoResultFound
from starlette.requests import Request

from aspen.api.auth import get_auth_user
from aspen.api.deps import get_db, get_settings
from aspen.api.error import http_exceptions as ex
from aspen.api.schemas.samples import SampleDeleteResponse, SamplesResponseSchema
from aspen.api.settings import Settings
from aspen.api.utils import (
    authz_samples_cansee,
    determine_gisaid_status,
    format_date,
    format_sample_lineage,
)
from aspen.database.models import (
    DataType,
    Entity,
    GisaidAccession,
    GisaidAccessionWorkflow,
    Sample,
    UploadedPathogenGenome,
    User,
)

router = APIRouter()

GISAID_REJECTION_TIME = datetime.timedelta(days=4)


@router.get("/")
async def list_samples(
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
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
    )
    user_visible_samples_query = authz_samples_cansee(all_samples_query, None, user)
    user_visible_samples_result = await db.execute(user_visible_samples_query)
    user_visible_samples: List[Sample] = (
        user_visible_samples_result.unique().scalars().all()
    )

    # Map gisaid accession workflows to samples.
    # This should all go away when we change how GISAID ISL's are retrieved for samples.
    SampleGisaidTuple = NamedTuple(
        "SampleGisaidTuple",
        [
            ("sample", Sample),
            ("uploaded_pathogen_genome", Optional[UploadedPathogenGenome]),
            ("gisaid_accession_workflow", Optional[GisaidAccessionWorkflow]),
            ("gisaid_accession", Optional[GisaidAccession]),
        ],
    )
    sample_gisaid_tuple_map: Dict[int, SampleGisaidTuple] = dict()
    genome_id_to_sample_id: Dict[int, int] = dict()
    for sample in user_visible_samples:
        if sample.uploaded_pathogen_genome is not None:
            sample_gisaid_tuple_map[sample.id] = SampleGisaidTuple(
                sample, sample.uploaded_pathogen_genome, None, None
            )
            genome_id_to_sample_id[
                sample.uploaded_pathogen_genome.entity_id
            ] = sample.id
        else:
            sample_gisaid_tuple_map[sample.id] = SampleGisaidTuple(
                sample, None, None, None
            )

    gisaid_accession_workflows_inputs_query = (
        sa.select(GisaidAccessionWorkflow)  # type: ignore
        .join(GisaidAccessionWorkflow.inputs)  # type: ignore
        .filter(Entity.id.in_(genome_id_to_sample_id.keys()))
        .options(
            selectinload(GisaidAccessionWorkflow.inputs),
        )
    )
    gisaid_accession_workflows_with_inputs_response = await db.execute(
        gisaid_accession_workflows_inputs_query
    )
    gisaid_accession_workflows_with_inputs: List[
        GisaidAccessionWorkflow
    ] = gisaid_accession_workflows_with_inputs_response.scalars().all()

    # get around circular references
    gisaid_accessions_query = sa.select(GisaidAccession).filter(  # type: ignore
        GisaidAccession.producing_workflow_id.in_(  # type: ignore
            [
                workflow.workflow_id
                for workflow in gisaid_accession_workflows_with_inputs
            ]
        )
    )
    gisaid_accessions_result = await db.execute(gisaid_accessions_query)
    gisaid_accessions = gisaid_accessions_result.scalars().all()

    workflow_to_accession_map: Dict[int, GisaidAccession] = dict()
    for accession in gisaid_accessions:
        workflow_to_accession_map[accession.producing_workflow_id] = accession

    for gisaid_accession_workflow in gisaid_accession_workflows_with_inputs:
        # A GisaidAccessionWorkflow is only ever going to have one input,
        # a single UploadedPathogenGenome. The only way to create the former
        # is through a method on the latter, and no other inputs are passed.
        # The relationship is effectively one-to-one, despite the current db
        # schema that technically allows for a many-to-many relationship.
        # This is the same for its relationship outputs.
        genome_id = gisaid_accession_workflow.inputs[0].entity_id
        sample_id = genome_id_to_sample_id[genome_id]
        origin_tuple = sample_gisaid_tuple_map[sample_id]
        gisaid_accession = workflow_to_accession_map.get(
            gisaid_accession_workflow.workflow_id, None
        )
        sample_gisaid_tuple_map[sample_id] = SampleGisaidTuple(
            origin_tuple.sample,
            origin_tuple.uploaded_pathogen_genome,
            gisaid_accession_workflow,
            gisaid_accession,
        )

    # populate sample object according to response schema
    results: MutableSequence[Mapping[str, Any]] = list()
    for sample_gisaid_tuple in sample_gisaid_tuple_map.values():
        sample = sample_gisaid_tuple.sample
        returned_sample_data = {
            "public_identifier": sample.public_identifier,
            "upload_date": (
                format_date(sample.uploaded_pathogen_genome.upload_date)
                if sample.uploaded_pathogen_genome
                else format_date(None)
            ),
            "collection_date": format_date(sample.collection_date),
            "sequencing_date": (
                format_date(sample.uploaded_pathogen_genome.sequencing_date)
                if sample.uploaded_pathogen_genome
                else format_date(None)
            ),
            "collection_location": sample.location,
            "gisaid": determine_gisaid_status(
                sample,
                sample_gisaid_tuple.gisaid_accession_workflow,
                sample_gisaid_tuple.gisaid_accession,
                GISAID_REJECTION_TIME,
            ),
            "czb_failed_genome_recovery": sample.czb_failed_genome_recovery,
            "lineage": format_sample_lineage(sample),
            "submitting_group": {
                "id": sample.submitting_group_id,
                "name": sample.submitting_group.name,
            },
            "uploaded_by": {
                "id": sample.uploaded_by_id,
                "name": sample.uploaded_by.name,
            },
            "private": sample.private,
        }

        if (
            sample.submitting_group_id == user.group_id
            or sample.submitting_group_id in cansee_groups_private_identifiers
            or user.system_admin
        ):
            returned_sample_data["private_identifier"] = sample.private_identifier

        results.append(returned_sample_data)
    return SamplesResponseSchema.parse_obj({"samples": results})


async def get_owned_sample_by_id(
    db: AsyncSession, sample_id: int, user: User
) -> Sample:
    query = sa.select(Sample).filter(  # type: ignore
        sa.and_(
            Sample.submitting_group == user.group,  # This is an access control check!
            Sample.id == sample_id,
        )
    )
    results = await db.execute(query)
    try:
        return results.scalars().one()
    except NoResultFound:
        raise ex.NotFoundException("sample not found")


@router.delete("/{sample_id}")
async def delete_sample(
    sample_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
) -> SampleDeleteResponse:
    # Make sure this sample exists and is delete-able by the current user.
    sample = await get_owned_sample_by_id(db, sample_id, user)
    sample_db_id = sample.id

    await db.delete(sample)
    await db.commit()
    return SampleDeleteResponse(id=sample_db_id)
