import datetime
import json

from typing import Iterable, MutableSequence

from flask import g, jsonify, request, Response
from marshmallow import fields, Schema, validate
from marshmallow.exceptions import ValidationError
from sqlalchemy import or_
from sqlalchemy.orm import joinedload

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
        .filter(
            or_(
                Sample.private_identifier.in_(sample_ids),
                Sample.public_identifier.in_(sample_ids),
            )
        )
        .options(
            joinedload(Sample.uploaded_pathogen_genome, innerjoin=True),
        )
    )
    # Step 3 - Enforce AuthZ
    all_samples = authz_sample_filters(all_samples, sample_ids, user)

    pathogen_genomes: MutableSequence[PathogenGenome] = list()
    for sample in all_samples:
        pathogen_genomes.append(sample.uploaded_pathogen_genome)
    if len(pathogen_genomes) == 0:
        raise ValueError("No sequences selected for run.")

    row = g.db_session.query(AlignedGisaidDump).one()
    aligned_gisaid_dump = (
        g.db_session.query(AlignedGisaidDump)
        .join(AlignedGisaidDump.producing_workflow)
        .order_by(Workflow.end_datetime.desc())
        .first()
    )
    if not aligned_gisaid_dump:
        raise ValueError("No gisaid dump for run.")

    template_path_prefix = "src/backend/aspen/workflows/nextstrain_run/builds_templates"
    builds_template_file = (
        f"{template_path_prefix}/{PHYLO_TREE_TYPES[request_data['tree_type']]}"
    )
    builds_template_args = {
        "division": group.division,
        "location": group.location,
        "run_name": request_data["name"],
    }

    workflow: PhyloRun = PhyloRun(
        start_datetime=datetime.datetime.now(),
        workflow_status=WorkflowStatusType.STARTED,
        software_versions={},
        group=group,
        template_file_path=builds_template_file,
        template_args=json.dumps(builds_template_args),
    )

    workflow.inputs = list(pathogen_genomes)
    workflow.inputs.append(aligned_gisaid_dump)

    g.db_session.add(workflow)
    g.db_session.flush()

    responseschema = PhyloRunResponseSchema()
    return jsonify(responseschema.dump(workflow))
