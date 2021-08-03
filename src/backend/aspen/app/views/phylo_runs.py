import datetime
import json
import sentry_sdk

from typing import Iterable, MutableSequence

from flask import g, jsonify, request, Response
from marshmallow import fields, Schema, validate
from marshmallow.exceptions import ValidationError
from sqlalchemy import or_
from sqlalchemy.orm import joinedload
from botocore.exceptions import ClientError

from aspen.app.app import application, requires_auth
from aspen.app.views.api_utils import authz_sample_filters
from aspen.database.models import (
    AlignedGisaidDump,
    PathogenGenome,
    PhyloRun,
    Sample,
    Workflow,
    WorkflowStatusType,
)

from aspen import aws

# What kinds of nextstrain build configs does this endpoint support?
PHYLO_TREE_TYPES = {
    "local": "local.yaml",
    "contextual": "contextual.yaml",
}


class PhyloRunRequestSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=1, max=128))
    samples = fields.List(fields.String(), required=True)
    tree_type = fields.String(
        required=True, validate=validate.OneOf(PHYLO_TREE_TYPES.keys())
    )


class GroupResponseSchema(Schema):
    id = fields.Int()
    name = fields.String()
    address = fields.String()
    prefix = fields.String()
    division = fields.String()
    location = fields.String()


class WorkflowStatusSchema(Schema):
    name = fields.String()


class PhyloRunResponseSchema(Schema):
    id = fields.Int()
    start_datetime = fields.DateTime()
    end_datetime = fields.DateTime()
    workflow_status = fields.Pluck(WorkflowStatusSchema, "name")
    group = fields.Nested(GroupResponseSchema, only=("id", "name"))
    template_file_path = fields.String()
    template_args = fields.String()


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
        return Response(str(verr), 400)
    sample_ids = request_data["samples"]

    # Step 2 - prepare big sample query per the old db cli
    all_samples: Iterable[Sample] = (
        g.db_session.query(Sample)
        .options(
            joinedload(Sample.uploaded_pathogen_genome, innerjoin=True),
        )
    )
    # Step 3 - Enforce AuthZ
    all_samples = authz_sample_filters(all_samples, sample_ids, user)

    pathogen_genomes: MutableSequence[PathogenGenome] = list()
    missing_sample_ids = list(sample_ids)  # Make a copy of sample id's
    for sample in all_samples:
        pathogen_genomes.append(sample.uploaded_pathogen_genome)
        try:
            missing_sample_ids.remove(sample.private_identifier)
        except ValueError:
            pass
        try:
            missing_sample_ids.remove(sample.public_identifier)
        except ValueError:
            pass
    if len(pathogen_genomes) == 0:
        raise ValueError("No sequences selected for run.")

    if missing_sample_ids:
        sentry_sdk.capture_message(
            f"User requested sample id's they didn't have access to ({missing_sample_ids})"
        )

    aligned_gisaid_dump = (
        g.db_session.query(AlignedGisaidDump)
        .join(AlignedGisaidDump.producing_workflow)
        .order_by(Workflow.end_datetime.desc())
        .first()
    )
    if not aligned_gisaid_dump:
        return Response("No gisaid dump for run", 500)

    template_path_prefix = "/usr/src/app/aspen/workflows/nextstrain_run/builds_templates"
    builds_template_file = (
        f"{template_path_prefix}/{PHYLO_TREE_TYPES[request_data['tree_type']]}"
    )
    builds_template_args = {
        "division": group.division,
        "location": group.location,
    }
    start_datetime=datetime.datetime.now()

    workflow: PhyloRun = PhyloRun(
        start_datetime=start_datetime,
        workflow_status=WorkflowStatusType.STARTED,
        software_versions={},
        group=group,
        template_file_path=builds_template_file,
        template_args=builds_template_args,
        name=request_data["name"],
    )

    workflow.inputs = list(pathogen_genomes)
    workflow.inputs.append(aligned_gisaid_dump)

    g.db_session.add(workflow)
    g.db_session.flush()

    responseschema = PhyloRunResponseSchema()

    # TODO - invoke a step function!
    # boto3.invok_step_something(parameters)
    aspen_config = application.aspen_config
    output_prefix_config_version = f"NEXTSTRAIN_RESULT_OUTPUT_PREFIX_{request_data['tree_type'].upper()}"

    sfn_input_json = {
      "Input": {
        "Run": {
          "aspen_config_secret_name": os.environ.get("ASPEN_CONFIG_SECRET_NAME", "aspen-config"),
          "aws_region": aws.region(),
          "docker_image_id": aspen_config.NEXTSTRAIN_DOCKER_IMAGE_ID,
          "group_name": group.name,
          "remote_dev_prefix": "",
          "s3_filestem": f"{group.location} {request_data["tree_type"].capitalize()}",
          "workflow_id": workflow.id,
        },
      },
      "OutputPrefix": aspen_config[output_prefix_config_version],
      "RUN_WDL_URI": aspen_config.SWIPE_WDL_URI,
      "RunEC2Memory": aspen_config.EC2_MEMORY,
      "RunEC2Vcpu": aspen_config.EC2_VCPU,
      "RunSPOTMemory": aspen_config.SPOT_MEMORY,
      "RunSPOTVcpu": aspen_config.SPOT_VCPU,
    }

    session = aws.session()
    client = session.client(
        service_name="stepfunctions",
        endpoint_url=os.getenv("BOTO_ENDPOINT_URL") or None
    )

    try:
        response = client.start_execution(
            stateMachineArn=os.getenv("NEXTSTRAIN_SFN_ARM"),
            name=f"{group.name}-{user.name}-ondemand-nextstrain-build-{start_datetime}",
            input=json.dumps(sfn_input_json)
        )
    except ClientError as e:
        return Response("Error starting phylo run", 500)
    
    return jsonify(responseschema.dump(workflow))
