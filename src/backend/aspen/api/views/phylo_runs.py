import datetime
import json
import os
import re
from typing import Iterable, List, MutableSequence, Set

import sentry_sdk
import sqlalchemy as sa
from boto3 import Session
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from sqlalchemy.orm.exc import NoResultFound
from starlette.requests import Request

from aspen.api.authn import get_auth_user
from aspen.api.authz import AuthZSession, get_authz_session
from aspen.api.deps import get_db, get_settings
from aspen.api.error import http_exceptions as ex
from aspen.api.schemas.phylo_runs import (
    PhyloRunDeleteResponse,
    PhyloRunRequest,
    PhyloRunResponse,
    PhyloRunsListResponse,
    PhyloRunUpdateRequest,
)
from aspen.api.settings import Settings
from aspen.api.utils import (
    authz_sample_filters,
    get_matching_gisaid_ids,
    get_matching_gisaid_ids_by_epi_isl,
    get_missing_and_found_sample_ids,
)
from aspen.database.models import (
    AlignedGisaidDump,
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


@router.post("/", responses={200: {"model": PhyloRunResponse}})
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
    gisaid_ids: Set[str] = await get_matching_gisaid_ids(db, missing_sample_ids)

    # Do we have any samples that are not aspen private or public identifiers or gisaid identifiers?
    missing_sample_ids = missing_sample_ids - gisaid_ids

    # Do the same, but for epi isls
    gisaid_ids_from_isls: Set[str]
    epi_isls: Set[str]
    gisaid_ids_from_isls, epi_isls = await get_matching_gisaid_ids_by_epi_isl(
        db, missing_sample_ids
    )
    missing_sample_ids -= epi_isls
    gisaid_ids |= gisaid_ids_from_isls

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
    start_datetime = datetime.datetime.now()

    template_args = {}
    # Not all template_args keys are required, and we don't want to save empty fields.
    if phylo_run_request.template_args:
        for k, v in dict(phylo_run_request.template_args).items():
            if not v:
                continue  # Skip this field
            if "date" in k:
                v = v.strftime("%Y-%m-%d")
            template_args[k] = v
    workflow: PhyloRun = PhyloRun(
        start_datetime=start_datetime,
        workflow_status=WorkflowStatusType.STARTED,
        software_versions={},
        group=group,
        template_args=template_args,
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


async def get_serializable_runs(
    db: AsyncSession, az: AuthZSession, privilege="read", run_id=None
):
    query = await az.authorized_query(privilege, PhyloRun)
    query = query.options(
        joinedload(PhyloRun.outputs.of_type(PhyloTree)),
        joinedload(PhyloRun.user),  # For Pydantic serialization
        joinedload(PhyloRun.group),  # For Pydantic serialization
    )
    if run_id:
        query = query.filter(PhyloRun.id == run_id)
    res = await db.execute(query)
    if run_id:
        try:
            run = res.unique().scalars().one()
        except NoResultFound:
            raise ex.NotFoundException("phylo run not found")
        if run.workflow_status == WorkflowStatusType.STARTED:
            raise ex.BadRequestException("Can't modify an in-progress phylo run")
        return run

    return res.unique().scalars().all()


@router.get("/", responses={200: {"model": PhyloRunsListResponse}})
async def list_runs(
    db: AsyncSession = Depends(get_db),
    az: AuthZSession = Depends(get_authz_session),
) -> PhyloRunsListResponse:

    phylo_runs: Iterable[PhyloRun] = await get_serializable_runs(db, az, "read")

    # filter for only information we need in sample table view
    results: List[PhyloRunResponse] = []
    for phylo_run in phylo_runs:
        results.append(PhyloRunResponse.from_orm(phylo_run))

    return PhyloRunsListResponse(phylo_runs=results)


@router.delete("/{item_id}", responses={200: {"model": PhyloRunDeleteResponse}})
async def delete_run(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    az: AuthZSession = Depends(get_authz_session),
) -> PhyloRunDeleteResponse:
    item = await get_serializable_runs(db, az, "write", item_id)
    item_db_id = item.id

    for output in item.outputs:
        await db.delete(output)
    await db.delete(item)
    await db.commit()
    return PhyloRunDeleteResponse(id=item_db_id)


@router.put("/{item_id}", responses={200: {"model": PhyloRunResponse}})
async def update_phylo_tree_and_run(
    item_id: int,
    phylo_run_update_request: PhyloRunUpdateRequest,
    db: AsyncSession = Depends(get_db),
    az: AuthZSession = Depends(get_authz_session),
) -> PhyloRunResponse:
    # get phylo_run and check that user has permission to update PhyloRun/PhyloTree
    phylo_run = await get_serializable_runs(db, az, "write", item_id)

    # update phylorun name
    phylo_run.name = phylo_run_update_request.name

    # if there are any associated PhyloTrees update those names as well:
    if phylo_run.outputs:
        for output in phylo_run.outputs:
            if isinstance(output, PhyloTree):
                output.name = phylo_run_update_request.name

    await db.commit()

    return PhyloRunResponse.from_orm(phylo_run)
