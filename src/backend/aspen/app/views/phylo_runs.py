import datetime
import json
import os
import re
from typing import Iterable, MutableSequence

import sentry_sdk
from flask import g, jsonify, request, make_response
from marshmallow.exceptions import ValidationError
from sqlalchemy.orm import joinedload

from aspen import aws
from aspen.app.app import application, requires_auth
from aspen.app.serializers import (
    PHYLO_TREE_TYPES,
    PhyloRunRequestSchema,
    PhyloRunResponseSchema,
)
from aspen.app.views.api_utils import authz_sample_filters
from aspen.database.models import (
    GisaidMetadata,
    AlignedGisaidDump,
    PathogenGenome,
    PhyloRun,
    Sample,
    Workflow,
    WorkflowStatusType,
)


@application.route("/api/phylo_runs", methods=["POST"])
@requires_auth
def start_phylo_run():
    user = g.auth_user
    # Note - sample run will be associated with users's primary group.
    #    (do we want admins to be able to start runs on behalf of other dph's ?)
    group = user.group

    # Step 1 - Validate our request body
    validator = PhyloRunRequestSchema()
    try:
        request_data = validator.load(request.get_json())
    except ValidationError as verr:
        sentry_sdk.capture_message(f"Invalid API request to /api/phyloruns", "info")
        response = make_response(str(verr), 400)
        response.headers['Content-Type'] = 'application/json'
        return response
    sample_ids = request_data["samples"]

    # Step 2 - prepare big sample query per the old db cli
    all_samples: Iterable[Sample] = g.db_session.query(Sample).options(
        joinedload(Sample.uploaded_pathogen_genome, innerjoin=True),
    )
    # Step 3 - Enforce AuthZ
    all_samples = authz_sample_filters(all_samples, sample_ids, user)

    # Step 4 - Create a phylo run & associated input rows in the DB
    pathogen_genomes: MutableSequence[PathogenGenome] = list()
    found_sample_ids = set()
    for sample in all_samples:
        pathogen_genomes.append(sample.uploaded_pathogen_genome)
        found_sample_ids.add(sample.private_identifier)
        found_sample_ids.add(sample.public_identifier)
    if len(pathogen_genomes) == 0:
        sentry_sdk.capture_message(f"No sequences selected for run from {sample_ids}.", "error")
        response = make_response(jsonify({"error": "No sequences selected for run"}), 400)
        response.headers['Content-Type'] = 'application/json'
        return response

    # These are the sample ID's that don't match the aspen db
    missing_sample_ids = set(sample_ids) - found_sample_ids

    # Store the list of matching ID's so we can stuff it in our jsonb column later
    gisaid_ids = set()
    # See if these missing samples match Gisaid ID's
    gisaid_matches: Iterable[GisaidMetadata] = g.db_session.query(GisaidMetadata).filter(GisaidMetadata.strain.in_(missing_sample_ids))
    for gisaid_match in gisaid_matches:
        gisaid_ids.add(gisaid_match.strain)

    # Do we have any samples that don't match either dataset?
    missing_sample_ids = missing_sample_ids - gisaid_ids

    # Throw an error if we have any sample ID's that didn't match county samples OR gisaid samples.
    if missing_sample_ids:
        sentry_sdk.capture_message(
           f"User requested invalid samples ({missing_sample_ids})")
        response = make_response(jsonify({"error": "missing ids", "ids": list(missing_sample_ids)}), 400)
        response.headers['Content-Type'] = 'application/json'
        return response

    aligned_gisaid_dump = (
        g.db_session.query(AlignedGisaidDump)
        .join(AlignedGisaidDump.producing_workflow)
        .order_by(Workflow.end_datetime.desc())
        .first()
    )
    if not aligned_gisaid_dump:
        sentry_sdk.capture_message(f"No Aligned Gisaid Dump found! Cannot create PhyloRun!", "fatal")
        response = make_response(jsonify({"error": "No gisaid dump for run"}), 500)
        response.headers['Content-Type'] = 'application/json'
        return response

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
    )

    # TODO -- our build pipeline assumes we've selected some samples, and everything stops making
    # sense if we have an empty includes.txt.
    if not pathogen_genomes:
        sentry_sdk.capture_message(f"No valid pathogen genomes found among local sample ids {found_sample_ids} or gisaid ids {gisaid_ids}! Not running tree build.", "error")
        response = make_response(jsonify({"error": "No valid pathogen genomes found. Not running tree build."}), 500)
        response.headers['Content-Type'] = 'application/json'
        return response

    workflow.inputs = list(pathogen_genomes)
    workflow.inputs.append(aligned_gisaid_dump)

    g.db_session.add(workflow)
    g.db_session.flush()

    responseschema = PhyloRunResponseSchema()

    # Step 5 - Kick off the phylo run job.
    aspen_config = application.aspen_config
    sfn_input_json = {
        "Input": {
            "Run": {
                "aspen_config_secret_name": os.environ.get(
                    "ASPEN_CONFIG_SECRET_NAME", "aspen-config"
                ),
                "aws_region": aws.region(),
                "docker_image_id": aspen_config.NEXTSTRAIN_DOCKER_IMAGE_ID,
                "remote_dev_prefix": os.getenv("REMOTE_DEV_PREFIX"),
                "s3_filestem": f"{group.location}/{request_data['tree_type'].capitalize()}",
                "workflow_id": workflow.id,
            },
        },
        "OutputPrefix": f"{aspen_config.NEXTSTRAIN_OUTPUT_PREFIX}/{workflow.id}",
        "RUN_WDL_URI": aspen_config.RUN_WDL_URI,
        "RunEC2Memory": aspen_config.NEXTSTRAIN_EC2_MEMORY,
        "RunEC2Vcpu": aspen_config.NEXTSTRAIN_EC2_VCPU,
        "RunSPOTMemory": aspen_config.NEXTSTRAIN_SPOT_MEMORY,
        "RunSPOTVcpu": aspen_config.NEXTSTRAIN_SPOT_VCPU,
    }

    session = aws.session()
    client = session.client(
        service_name="stepfunctions",
        endpoint_url=os.getenv("BOTO_ENDPOINT_URL") or None,
    )

    execution_name = (
        f"{group.name}-{user.name}-ondemand-nextstrain-build-{str(start_datetime)}"
    )
    execution_name = re.sub(r"[^0-9a-zA-Z-]", r"-", execution_name)

    client.start_execution(
        stateMachineArn=os.environ.get("NEXTSTRAIN_SFN_ARN"),
        name=execution_name,
        input=json.dumps(sfn_input_json),
    )

    response = make_response(jsonify(responseschema.dumps(workflow)), 200)
    response.headers['Content-Type'] = 'application/json'
    return response
