import json
import os
import re
import uuid
from datetime import datetime, timedelta
from typing import Any, Callable, Iterable, Mapping, MutableSequence, Optional, Set

import boto3
import sqlalchemy
from flask import g, jsonify, make_response
from sqlalchemy import or_
from sqlalchemy.orm import aliased, contains_eager, joinedload, Query, Session

from aspen.app.app import application, requires_auth
from aspen.app.views.api_utils import (
    authz_phylo_tree_filters,
    format_date,
    format_datetime,
)
from aspen.database.models import (
    DataType,
    PhyloRun,
    PhyloTree,
    Sample,
    UploadedPathogenGenome,
)
from aspen.database.models.usergroup import User
from aspen.error import http_exceptions as ex
from aspen.fileio.tsv_streamer import MetadataTSVStreamer
from aspen.phylo_tree.identifiers import rename_nodes_on_tree

PHYLO_TREE_KEY = "phylo_trees"


def humanize_tree_name(s3_key: str):
    json_filename = s3_key.split("/")[-1]
    basename = re.sub(r".json", "", json_filename)
    if basename == "ncov_aspen":
        return s3_key.split("/")[1]  # Return the directory name.
    title_case = basename.replace("_", " ").title()
    if "Ancestors" in title_case:
        title_case = title_case.replace("Ancestors", "Contextual")
    if " Public" in title_case:
        title_case = title_case.replace(" Public", "")
    if " Private" in title_case:
        title_case = title_case.replace(" Private", "")
    return title_case


def generate_tree_name_from_template(phylo_run: PhyloRun) -> str:
    # template_args should be transparently deserialized into a python dict.
    # but if something is wrong with the data in the column (i.e. the json is
    # double escaped), it will be a string instead.
    location = phylo_run.group.location  # safe default
    if isinstance(phylo_run.template_args, Mapping):
        template_args = phylo_run.template_args
        location = template_args.get("location", location)
    return f"{location} Tree {format_date(phylo_run.start_datetime)}"


@application.route("/api/phylo_trees", methods=["GET"])
@requires_auth
def phylo_trees():
    user = g.auth_user
    cansee_owner_group_ids: Set[int] = {
        cansee.owner_group_id
        for cansee in user.group.can_see
        if cansee.data_type == DataType.TREES
    }
    phylo_run_alias = aliased(PhyloRun)
    phylo_runs: Iterable[PhyloRun] = (
        g.db_session.query(
            phylo_run_alias,
        )
        .options(
            joinedload(phylo_run_alias.outputs.of_type(PhyloTree)),
            joinedload(phylo_run_alias.user),
            joinedload(phylo_run_alias.group),
        )
        .filter(
            or_(
                user.system_admin,
                phylo_run_alias.group_id == user.group.id,
                phylo_run_alias.group_id.in_(cansee_owner_group_ids),
            )
        )
    )

    # filter for only information we need in sample table view
    results: MutableSequence[Mapping[str, Any]] = list()
    for phylo_run in phylo_runs:
        phylo_tree: Optional[PhyloTree] = None
        result: Mapping[str, Any] = {
            "started_date": format_datetime(phylo_run.start_datetime),
            "completed_date": format_datetime(phylo_run.end_datetime),
            "status": phylo_run.workflow_status.value,
            "workflow_id": phylo_run.workflow_id,
            "pathogen_genome_count": 0,  # TODO: do we still need this?,
            "tree_type": phylo_run.tree_type.value,
            "user": {},
            "group": {
                "id": phylo_run.group.id,
                "name": phylo_run.group.name,
            },
        }
        if phylo_run.user:
            result["user"] = {"id": phylo_run.user.id, "name": phylo_run.user.name}
        for output in phylo_run.outputs:
            if isinstance(output, PhyloTree):
                phylo_tree = output
                result = result | {
                    "phylo_tree_id": phylo_tree.entity_id,
                    "name": phylo_tree.name or humanize_tree_name(phylo_tree.s3_key),
                }
        if not phylo_tree:
            result = result | {
                "phylo_tree_id": None,
                "name": phylo_run.name or generate_tree_name_from_template(phylo_run),
            }
            if phylo_run.start_datetime and phylo_run.start_datetime < (
                datetime.now() - timedelta(hours=12)
            ):
                result["status"] = "FAILED"
        results.append(result)

    return jsonify({PHYLO_TREE_KEY: results})


def _process_phylo_tree(db_session: Session, phylo_tree_id: int, user: User) -> dict:
    """Retrieves a phylo tree and renames the nodes on the tree for a given user."""
    tree_query: Query = (
        db_session.query(PhyloTree)
        .join(PhyloRun)
        .options(joinedload(PhyloTree.constituent_samples))
    )
    tree_query = authz_phylo_tree_filters(tree_query, {phylo_tree_id}, user)
    phylo_tree: PhyloTree
    try:
        phylo_tree = tree_query.one()
    except sqlalchemy.exc.NoResultFound:  # type: ignore
        raise ex.BadRequestException(
            f"PhyloTree with id {phylo_tree_id} not viewable by user with id: {user.id}"
        )

    sample_filter: Callable[[Sample], bool]
    if user.system_admin:

        def sample_filter(_: Sample):
            return True

    else:
        can_see_group_ids_pi: Set[int] = {user.group_id}
        can_see_group_ids_pi.update(
            {
                can_see.owner_group_id
                for can_see in user.group.can_see
                if can_see.data_type == DataType.PRIVATE_IDENTIFIERS
            }
        )

        def sample_filter(sample: Sample):
            return sample.submitting_group_id in can_see_group_ids_pi

    identifier_map: Mapping[str, str] = {
        sample.public_identifier.replace("hCoV-19/", ""): sample.private_identifier
        for sample in phylo_tree.constituent_samples
        if sample_filter(sample)
    }

    s3 = boto3.resource(
        "s3",
        endpoint_url=os.getenv("BOTO_ENDPOINT_URL") or None,
        config=boto3.session.Config(signature_version="s3v4"),
    )

    data = (
        s3.Bucket(phylo_tree.s3_bucket).Object(phylo_tree.s3_key).get()["Body"].read()
    )
    json_data = json.loads(data)

    rename_nodes_on_tree([json_data["tree"]], identifier_map, "GISAID_ID")

    return json_data


def _get_selected_samples(db_session, phylo_tree_id):
    # SqlAlchemy requires aliasing for any queries that join to the same table (in this case, entities)
    # multiple times via joined table inheritance
    # ref: https://github.com/sqlalchemy/sqlalchemy/discussions/6972
    entity_alias = aliased(UploadedPathogenGenome, flat=True)
    phylo_tree: PhyloTree = (
        db_session.query(PhyloTree)
        .join(PhyloRun, PhyloTree.producing_workflow.of_type(PhyloRun))
        .outerjoin(entity_alias, PhyloRun.inputs.of_type(entity_alias))
        .outerjoin(Sample)
        .filter(PhyloTree.entity_id == phylo_tree_id)
        .options(
            contains_eager(PhyloTree.producing_workflow.of_type(PhyloRun))
            .contains_eager(PhyloRun.inputs.of_type(entity_alias))
            .contains_eager(entity_alias.sample)
        )
        .one()
    )

    phylo_run = phylo_tree.producing_workflow
    selected_samples = set(phylo_run.gisaid_ids)
    for uploaded_pathogen_genome in phylo_run.inputs:
        sample = uploaded_pathogen_genome.sample
        selected_samples.add(sample.public_identifier.replace("hCoV-19/", ""))
        selected_samples.add(sample.private_identifier)
    return selected_samples


@application.route("/api/phylo_tree/<int:phylo_tree_id>", methods=["GET"])
@requires_auth
def phylo_tree(phylo_tree_id: int):
    phylo_tree_data = _process_phylo_tree(g.db_session, phylo_tree_id, g.auth_user)
    response = make_response(phylo_tree_data)
    response.headers["Content-Type"] = "application/json"
    response.headers[
        "Content-Disposition"
    ] = f"attachment; filename={phylo_tree_id}.json"

    return response


def _extract_accessions(accessions_list: list, node: dict):
    node_attributes = node.get("node_attrs", {})
    if "external_accession" in node_attributes:
        accessions_list.append(node_attributes["external_accession"]["value"])
    if "name" in node:
        # NODE_ is some sort of generic name and not useful
        if not re.match("NODE_", node["name"]):
            accessions_list.append(node["name"])
    if "children" in node:
        for child in node["children"]:
            _extract_accessions(accessions_list, child)
    return accessions_list


@application.route("/api/phylo_tree/sample_ids/<int:phylo_tree_id>", methods=["GET"])
@requires_auth
def tree_sample_ids(phylo_tree_id: int):
    phylo_tree_data = _process_phylo_tree(g.db_session, phylo_tree_id, g.auth_user)
    accessions = _extract_accessions([], phylo_tree_data["tree"])
    selected_samples = _get_selected_samples(g.db_session, phylo_tree_id)

    filename: str = f"{phylo_tree_id}_sample_ids.tsv"
    streamer = MetadataTSVStreamer(filename, accessions, selected_samples)
    return streamer.get_response()


@application.route("/api/auspice/view/<int:phylo_tree_id>", methods=["GET"])
@requires_auth
def auspice_view(phylo_tree_id: int):
    phylo_tree_data = _process_phylo_tree(g.db_session, phylo_tree_id, g.auth_user)

    s3_resource = boto3.resource(
        "s3",
        endpoint_url=os.getenv("BOTO_ENDPOINT_URL") or None,
        config=boto3.session.Config(signature_version="s3v4"),
    )
    s3_bucket = application.aspen_config.EXTERNAL_AUSPICE_BUCKET
    s3_key = str(uuid.uuid4())
    s3_resource.Bucket(s3_bucket).Object(s3_key).put(Body=json.dumps(phylo_tree_data))
    s3_client = s3_resource.meta.client

    presigned_url = s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": s3_bucket, "Key": s3_key},
        ExpiresIn=3600,
    )

    return jsonify({"url": presigned_url})
