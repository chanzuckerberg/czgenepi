from typing import Set

import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from starlette.requests import Request

from aspen.api.auth import get_auth_user
from aspen.api.deps import get_db, get_settings
from aspen.api.schemas.samples import SamplesResponseSchema
from aspen.api.settings import Settings
from aspen.api.utils import authz_samples_cansee, format_date, format_sample_lineage
from aspen.database.models import (
    DataType,
    Entity,
    GisaidAccessionWorkflow,
    Sample,
    User,
)

router = APIRouter()


@router.get("/")
async def list_samples(
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
) -> SamplesResponseSchema:
    cansee_groups_metadata: Set[int] = {
        cansee.owner_group_id
        for cansee in user.group.can_see
        if cansee.data_type == DataType.METADATA
    }
    cansee_groups_private_identifiers: Set[int] = {
        cansee.owner_group_id
        for cansee in user.group.can_see
        if cansee.data_type == DataType.PRIVATE_IDENTIFIERS
    }

    # load the samples.
    all_samples_query = sa.select(Sample).options(
        joinedload(Sample.uploaded_pathogen_genome, innerjoin=True)
    )

    user_visible_samples_query = authz_samples_cansee(all_samples_query, None, user)
    user_visible_samples = await db.execute(user_visible_samples_query)
    user_visible_samples: List[Sample] = user_visible_samples.unique().scalars().all()

    samples_with_genomes_ids: MutableSequence[int] = list()
    for sample in user_visible_samples:
        if sample.uploaded_pathogen_genome is not None:
            samples_with_genomes_ids.append(sample.uploaded_pathogen_genome.entity_id)

    # load the gisaid_accessioning workflows.
    gisaid_accession_workflows_query = sa.select(GisaidAccessionWorkflow)
    # gisaid_accession_workflows: Sequence[GisaidAccessionWorkflow] = (
    #     g.db_session.query(GisaidAccessionWorkflow)
    #     .join(GisaidAccessionWorkflow.inputs)
    #     .filter(Entity.id.in_(samples_with_genomes_ids))
    #     .options(
    #         joinedload(GisaidAccessionWorkflow.inputs),
    #         joinedload(GisaidAccessionWorkflow.outputs.of_type(GisaidAccession)),
    #     )
    #     .all()
    # )
    # entity_id_to_gisaid_accession_workflow_map: defaultdict[
    #     int, list[GisaidAccessionWorkflow]
    # ] = defaultdict(list)
    # for gisaid_accession_workflow in gisaid_accession_workflows:
    #     for workflow_input in gisaid_accession_workflow.inputs:
    #         if isinstance(workflow_input, (UploadedPathogenGenome)):
    #             entity_id_to_gisaid_accession_workflow_map[
    #                 workflow_input.entity_id
    #             ].append(gisaid_accession_workflow)
    # for (
    #     gisaid_accession_workflow_list
    # ) in entity_id_to_gisaid_accession_workflow_map.values():
    #     # sort by success, date.
    #     gisaid_accession_workflow_list.sort(
    #         key=lambda gisaid_accession_workflow: (
    #             1
    #             if gisaid_accession_workflow.workflow_status
    #             == WorkflowStatusType.COMPLETED
    #             else 0,
    #             gisaid_accession_workflow.start_datetime,
    #         ),
    #         reverse=True,
    #     )

    # filter for only information we need in sample table view
    results: MutableSequence[Mapping[str, Any]] = list()
    for sample in user_visible_samples:
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
            # "gisaid": _format_gisaid_accession(
            #     sample, entity_id_to_gisaid_accession_workflow_map
            # ),
            "czb_failed_genome_recovery": sample.czb_failed_genome_recovery,
            "lineage": format_sample_lineage(sample),
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


@router.delete("/{sample_id}")
async def delete_sample(
    sample_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
) -> bool:
    return False
