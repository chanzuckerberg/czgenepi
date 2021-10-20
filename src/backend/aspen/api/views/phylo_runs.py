from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request
import datetime

from boto3 import Session

import sentry_sdk
import re
import json

import sqlalchemy as sa
from sqlalchemy.orm import joinedload

from aspen.api.deps import get_db
from aspen.api.schemas.users import User as userschema

from aspen.api.settings import get_settings
import os

from aspen.database.models import (
    User,
    Sample,
    PathogenGenome,
    TreeType,
    AlignedGisaidDump,
    Workflow,
    PhyloRun,
    WorkflowStatusType
)

from aspen.api.error import http_exceptions as ex

from aspen.app.views.api_utils import (
    authz_sample_filters,
    get_matching_gisaid_ids,
    get_missing_and_found_sample_ids,
)

from aspen.api.utils import get_matching_gisaid_ids
from aspen.api.schemas.phylo_runs import PhyloRunRequestSchema, PhyloRunResponseSchema

from typing import Iterable, MutableSequence

# What kinds of ondemand nextstrain builds do we support?
PHYLO_TREE_TYPES = {
    TreeType.NON_CONTEXTUALIZED.value: "non_contextualized.yaml",
    TreeType.TARGETED.value: "targeted.yaml",
}

# route
router = APIRouter()

@router.post("/")
async def kick_off_phylo_run(phylo_run_request: PhyloRunRequestSchema, request: Request, db: AsyncSession = Depends(get_db)) -> PhyloRunResponseSchema:
    user = request.state.auth_user
    # Note - sample run will be associated with users's primary group.
    #    (do we want admins to be able to start runs on behalf of other dph's ?)
    group = user.group

    # validation happens in input schema

    sample_ids = phylo_run_request.samples
    
    # Step 2 - prepare big sample query per the old db cli
    # all_samples: Iterable[Sample] = db.query(Sample).options(
    #     joinedload(Sample.uploaded_pathogen_genome, innerjoin=True),
    # )
    all_samples_query: Iterable[Sample] = sa.select(Sample).options(joinedload(Sample.uploaded_pathogen_genome, innerjoin=True),)

    # Step 3 - Enforce AuthZ (check if user has permission to see private identifiers and scope down the search for matching ID's to groups that the user has read access to.)
    # user_visible_samples = authz_sample_filters(all_samples, sample_ids, user)
    user_visible_sample_query = authz_sample_filters(all_samples_query, sample_ids, user)
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
    if len(pathogen_genomes) == 0:
        sentry_sdk.capture_message(
            f"No sequences selected for run from {sample_ids}.", "error"
        )
        raise ex.BadRequestException("No sequences selected for run")

    # 4B - AlignedGisaidDump
    aligned_gisaid_dump_query = (
        sa.select(AlignedGisaidDump)
        .join(AlignedGisaidDump.producing_workflow)
        .order_by(Workflow.end_datetime.desc())
        .limit(1)
    )
    aligned_gisaid_dump = await db.execute(aligned_gisaid_dump_query)
    aligned_gisaid_dump = aligned_gisaid_dump.scalars().first()
    if not aligned_gisaid_dump:
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
    )
    workflow.inputs = list(pathogen_genomes)
    workflow.inputs.append(aligned_gisaid_dump)

    db.add(workflow)
    await db.commit()

    # Step 5 - Kick off the phylo run job.
    aws_region = os.environ.get("AWS_REGION")
    settings = get_settings()
    sfn_params = settings.AWS_NEXTSTRAIN_SFN_PARAMETERS
    sfn_input_json = {
        "Input": {
            "Run": {
                "aspen_config_secret_name": os.environ.get(
                    "ASPEN_CONFIG_SECRET_NAME", "aspen-config"
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

    result = client.start_execution(
        stateMachineArn=sfn_params["StateMachineArn"],
        name=execution_name,
        input=json.dumps(sfn_input_json),
    )


    return PhyloRunResponseSchema.from_orm(workflow)
