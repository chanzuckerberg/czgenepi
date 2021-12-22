import datetime
import json
import os
import re
from typing import Iterable, List, MutableSequence, Set

import sentry_sdk
import sqlalchemy as sa
from boto3 import Session
from fastapi import APIRouter, Depends
from sqlalchemy import or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, joinedload
from sqlalchemy.orm.exc import NoResultFound
from starlette.requests import Request

from aspen.api.auth import get_auth_user
from aspen.api.deps import get_db, get_settings
from aspen.api.error import http_exceptions as ex
from aspen.api.schemas.phylo_runs import (
    PHYLO_TREE_TYPES,
    PhyloRunDeleteResponse,
    PhyloRunRequest,
    PhyloRunResponse,
    PhyloRunsListResponse,
    PhyloRunUpdateRequest,
    PhyloRunUpdateResponse,
)
from aspen.api.settings import Settings
from aspen.api.utils import get_matching_gisaid_ids
from aspen.app.views.api_utils import (
    authz_sample_filters,
    get_missing_and_found_sample_ids,
)
from aspen.database.models import (
    AlignedGisaidDump,
    DataType,
    PathogenGenome,
    PhyloRun,
    PhyloTree,
    Sample,
    TreeType,
    User,
    Workflow,
    WorkflowStatusType,
)

router = APIRouter()


@router.post("/")
async def kick_off_phylo_run(
    phylo_run_request: PhyloRunRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
) -> PhyloRunResponse:
    # Note - sample run will be associated with users's primary group.
    #    (do we want admins to be able to start runs on behalf of other dph's ?)
    group = user.group

    # validation happens in input schema

    sample_ids = phylo_run_request.samples

    # Step 2 - prepare big sample query per the old db cli
    all_samples_query = sa.select(Sample).options(  # type: ignore
        joinedload(Sample.uploaded_pathogen_genome, innerjoin=True),
    )

    # Step 3 - Enforce AuthZ (check if user has permission to see private identifiers and scope down the search for matching ID's to groups that the user has read access to.)
    user_visible_sample_query = authz_sample_filters(
        all_samples_query, sample_ids, user
    )
    user_visible_samples = await db.execute(user_visible_sample_query)
    user_visible_samples = user_visible_samples.unique().scalars().all()

    # Are there any sample ID's that don't match sample table public and private identifiers
    missing_sample_ids, found_sample_ids = get_missing_and_found_sample_ids(
        sample_ids, user_visible_samples
    )

    # See if these missing_sample_ids match any Gisaid IDs
    gisaid_ids = await get_matching_gisaid_ids(missing_sample_ids, db)

    # Do we have any samples that are not aspen private or public identifiers or gisaid identifiers?
    missing_sample_ids = missing_sample_ids - gisaid_ids

    # Throw an error if we have any sample ID's that didn't match county samples OR gisaid samples.
    if missing_sample_ids:
        sentry_sdk.capture_message(
            f"User requested invalid samples ({missing_sample_ids})"
        )
        raise ex.BadRequestException("missing ids", {"ids": list(missing_sample_ids)})

    # Step 4 - Create a phylo run & associated input rows in the DB
    # 4A - collect the sample sequences
    pathogen_genomes: MutableSequence[PathogenGenome] = list()
    for sample in user_visible_samples:
        pathogen_genomes.append(sample.uploaded_pathogen_genome)
    if len(pathogen_genomes) == 0 and len(gisaid_ids) == 0:
        sentry_sdk.capture_message(
            f"No sequences selected for run from {sample_ids}.", "error"
        )
        raise ex.BadRequestException("No sequences selected for run")

    # 4B - AlignedGisaidDump
    aligned_gisaid_dump_query = (  # type: ignore
        sa.select(AlignedGisaidDump)  # type: ignore
        .join(AlignedGisaidDump.producing_workflow)  # type: ignore
        .order_by(Workflow.end_datetime.desc())  # type: ignore
        .limit(1)  # type: ignore
    )
    aligned_gisaid_dump = await db.execute(aligned_gisaid_dump_query)
    try:
        aligned_gisaid_dump = aligned_gisaid_dump.scalars().one()
    except NoResultFound:
        sentry_sdk.capture_message(
            "No Aligned Gisaid Dump found! Cannot create PhyloRun!", "fatal"
        )
        raise ex.ServerException("No gisaid dump for run")

    # 4C build our PhyloRun object
    template_path_prefix = (
        "/usr/src/app/aspen/workflows/nextstrain_run/builds_templates"
    )
    builds_template_file = (
        f"{template_path_prefix}/{PHYLO_TREE_TYPES[phylo_run_request.tree_type]}"
    )
    builds_template_args = {
        "division": group.division,
        "location": group.location,
    }
    start_datetime = datetime.datetime.now()

    workflow: PhyloRun = PhyloRun(
        start_datetime=start_datetime,
        workflow_status=WorkflowStatusType.STARTED,
        software_versions={},
        group=group,
        template_file_path=builds_template_file,
        template_args=builds_template_args,
        name=phylo_run_request.name,
        gisaid_ids=list(gisaid_ids),
        tree_type=TreeType(phylo_run_request.tree_type),
        user=user,
        outputs=[],  # Make our response schema happy.
    )
    workflow.inputs = list(pathogen_genomes)
    workflow.inputs.append(aligned_gisaid_dump)

    db.add(workflow)
    await db.commit()

    # Step 5 - Kick off the phylo run job.
    aws_region = os.environ.get("AWS_REGION")
    sfn_params = settings.AWS_NEXTSTRAIN_SFN_PARAMETERS
    sfn_input_json = {
        "Input": {
            "Run": {
                "genepi_config_secret_name": os.environ.get(
                    "GENEPI_CONFIG_SECRET_NAME", "genepi-config"
                ),
                "aws_region": aws_region,
                "docker_image_id": sfn_params["Input"]["Run"]["docker_image_id"],
                "remote_dev_prefix": os.getenv("REMOTE_DEV_PREFIX"),
                "s3_filestem": f"{group.location}/{phylo_run_request.tree_type.capitalize()}",
                "workflow_id": workflow.id,
            },
        },
        "OutputPrefix": f"{sfn_params['OutputPrefix']}/{workflow.id}",
        "RUN_WDL_URI": sfn_params["RUN_WDL_URI"],
        "RunEC2Memory": sfn_params["RunEC2Memory"],
        "RunEC2Vcpu": sfn_params["RunEC2Vcpu"],
        "RunSPOTMemory": sfn_params["RunSPOTMemory"],
        "RunSPOTVcpu": sfn_params["RunSPOTVcpu"],
    }

    session = Session(region_name=aws_region)
    client = session.client(
        service_name="stepfunctions",
        endpoint_url=os.getenv("BOTO_ENDPOINT_URL") or None,
    )

    execution_name = f"{group.prefix}-ondemand-nextstrain-{str(start_datetime)}"
    execution_name = re.sub(r"[^0-9a-zA-Z-]", r"-", execution_name)

    client.start_execution(
        stateMachineArn=sfn_params["StateMachineArn"],
        name=execution_name,
        input=json.dumps(sfn_input_json),
    )

    return PhyloRunResponse.from_orm(workflow)


async def get_editable_phylo_run_by_id(db, run_id, user):
    query = (
        sa.select(PhyloRun)
        .filter(
            sa.and_(
                PhyloRun.group == user.group,  # This is an access control check!
                PhyloRun.id == run_id,
            )
        )
        .options(joinedload(PhyloRun.outputs))
    )
    results = await db.execute(query)
    try:
        run = results.scalars().unique().one()
    except NoResultFound:
        raise ex.NotFoundException("phylo run not found")
    if run.workflow_status == WorkflowStatusType.STARTED:
        raise ex.BadRequestException("Can't modify an in-progress phylo run")
    return run


@router.get("/")
async def list_runs(
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
) -> PhyloRunsListResponse:
    cansee_owner_group_ids: Set[int] = {
        cansee.owner_group_id
        for cansee in user.group.can_see
        if cansee.data_type == DataType.TREES
    }
    phylo_run_alias = aliased(PhyloRun)
    phylo_runs_query = (
        sa.select(phylo_run_alias)  # type: ignore
        .options(
            joinedload(phylo_run_alias.outputs.of_type(PhyloTree)),
            joinedload(phylo_run_alias.user),  # For Pydantic serialization
            joinedload(phylo_run_alias.group),  # For Pydantic serialization
        )
        .filter(
            or_(
                user.system_admin,
                phylo_run_alias.group_id == user.group.id,
                phylo_run_alias.group_id.in_(cansee_owner_group_ids),
            )
        )
    )
    phylo_run_results = await db.execute(phylo_runs_query)
    phylo_runs: Iterable[PhyloRun] = phylo_run_results.unique().scalars().all()

    # filter for only information we need in sample table view
    results: List[PhyloRunResponse] = []
    for phylo_run in phylo_runs:
        results.append(PhyloRunResponse.from_orm(phylo_run))

    return PhyloRunsListResponse(phylo_runs=results)


@router.delete("/{item_id}")
async def delete_run(
    item_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
) -> bool:
    item = await get_editable_phylo_run_by_id(db, item_id, user)
    item_db_id = item.id

    for output in item.outputs:
        await db.delete(output)
    await db.delete(item)
    await db.commit()
    return PhyloRunDeleteResponse(id=item_db_id)


@router.put("/{item_id}")
async def update_phylo_tree_and_run(
    item_id: int,
    phylo_run_update_request: PhyloRunUpdateRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_auth_user),
):
    # get phylo_run and check that user has permission to update PhyloRun/PhyloTree
    phylo_run = await get_editable_phylo_run_by_id(db, item_id, user)

    async with db as session:
        # update phylorun name
        phylo_run.name = phylo_run_update_request.name

        # if there are any associated PhyloTrees update those names as well:
        if phylo_run.outputs:
            # there should only be one phylotree associated with the phylorun
            phylo_tree = phylo_run.outputs[0]
            phylo_tree.name = phylo_run_update_request.name

        await session.commit()

    return PhyloRunUpdateResponse(id=phylo_run.id)
