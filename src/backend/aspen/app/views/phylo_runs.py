import datetime
import json
import os
import re
from typing import Iterable, MutableSequence

import sentry_sdk
from flask import g, make_response, request
from marshmallow.exceptions import ValidationError
from sqlalchemy.orm import joinedload

from aspen import aws
from aspen.app.app import application, requires_auth
from aspen.app.serializers import (
    PHYLO_TREE_TYPES,
    PhyloRunRequestSchema,
    PhyloRunResponseSchema,
)
from aspen.app.views.api_utils import (
    authz_sample_filters,
    get_matching_gisaid_ids,
    get_missing_and_found_sample_ids,
)
from aspen.database.models import (
    AlignedGisaidDump,
    PathogenGenome,
    PhyloRun,
    Sample,
    TreeType,
    Workflow,
    WorkflowStatusType,
)
from aspen.error import http_exceptions as ex


@application.route("/api/phylo_runs", methods=["POST"])
@requires_auth
def start_phylo_run():
    user = g.auth_user
    # Note - sample run will be associated with users's primary group.
    #    (do we want admins to be able to start runs on behalf of other dph's ?)
    group = user.group

    # Step 1 - Validate our request body
    validator = PhyloRunRequestSchema()
    request_json = request.get_json()
    # We use uppercase string values in the enum but we don't particularly
    # care what case the request is in.
    if isinstance(request_json["tree_type"], str):
        request_json["tree_type"] = request_json["tree_type"].upper()
    try:
        request_data = validator.load(request_json)
    except ValidationError as verr:
        sentry_sdk.capture_message("Invalid API request to /api/phyloruns", "info")
        raise ex.BadRequestException(str(verr))
    sample_ids = request_data["samples"]

    # Step 2 - prepare big sample query per the old db cli
    all_samples: Iterable[Sample] = g.db_session.query(Sample).options(
        joinedload(Sample.uploaded_pathogen_genome, innerjoin=True),
    )

    # Step 3 - Enforce AuthZ (check if user has permission to see private identifiers and scope down the search for matching ID's to groups that the user has read access to.)
    user_visible_samples = authz_sample_filters(all_samples, sample_ids, user)

    # Are there any sample ID's that don't match sample table public and private identifiers
    missing_sample_ids, found_sample_ids = get_missing_and_found_sample_ids(
        sample_ids, user_visible_samples
    )

    # See if these missing_sample_ids match any Gisaid IDs
    gisaid_ids = get_matching_gisaid_ids(missing_sample_ids, g.db_session)

    # Do we have any samples that are not aspen private or public identifiers or gisaid identifiers?
    missing_sample_ids = missing_sample_ids - gisaid_ids

    # Throw an error if we have any sample ID's that didn't match county samples OR gisaid samples.
    if missing_sample_ids:
        sentry_sdk.capture_message(
            f"User requested invalid samples ({missing_sample_ids})"
        )
        raise ex.BadRequestException("missing ids", {"ids": list(missing_sample_ids)})

    # Step 4 - Create a phylo run & associated input rows in the DB
    pathogen_genomes: MutableSequence[PathogenGenome] = list()
    for sample in user_visible_samples:
        pathogen_genomes.append(sample.uploaded_pathogen_genome)
    if len(pathogen_genomes) == 0:
        sentry_sdk.capture_message(
            f"No sequences selected for run from {sample_ids}.", "error"
        )
        raise ex.BadRequestException("No sequences selected for run")

    aligned_gisaid_dump = (
        g.db_session.query(AlignedGisaidDump)
        .join(AlignedGisaidDump.producing_workflow)
        .order_by(Workflow.end_datetime.desc())
        .first()
    )
    if not aligned_gisaid_dump:
        sentry_sdk.capture_message(
            "No Aligned Gisaid Dump found! Cannot create PhyloRun!", "fatal"
        )
        raise ex.ServerException("No gisaid dump for run")

    template_path_prefix = (
        "/usr/src/app/aspen/workflows/nextstrain_run/builds_templates"
    )
    builds_template_file = (
        f"{template_path_prefix}/{PHYLO_TREE_TYPES[request_data['tree_type']]}"
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
        name=request_data["name"],
        gisaid_ids=list(gisaid_ids),
        tree_type=TreeType(request_data["tree_type"]),
    )

    # TODO -- our build pipeline assumes we've selected some samples, and everything stops making
    # sense if we have an empty includes.txt.
    if not pathogen_genomes:
        sentry_sdk.capture_message(
            f"No valid pathogen genomes found among local sample ids {found_sample_ids} or gisaid ids {gisaid_ids}! Not running tree build.",
            "error",
        )
        raise ex.ServerException(
            "No valid pathogen genomes found. Not running tree build."
        )

    workflow.inputs = list(pathogen_genomes)
    workflow.inputs.append(aligned_gisaid_dump)

    g.db_session.add(workflow)
    g.db_session.flush()

    responseschema = PhyloRunResponseSchema()

    # Step 5 - Kick off the phylo run job.
    sfn_params = application.aspen_config.AWS_NEXTSTRAIN_SFN_PARAMETERS
    sfn_input_json = {
        "Input": {
            "Run": {
                "aspen_config_secret_name": os.environ.get(
                    "ASPEN_CONFIG_SECRET_NAME", "aspen-config"
                ),
                "aws_region": aws.region(),
                "docker_image_id": sfn_params["Input"]["Run"]["docker_image_id"],
                "remote_dev_prefix": os.getenv("REMOTE_DEV_PREFIX"),
                "s3_filestem": f"{group.location}/{request_data['tree_type'].capitalize()}",
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

    session = aws.session()
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

    response = make_response(responseschema.dumps(workflow), 200)
    response.headers["Content-Type"] = "application/json"
    return response
