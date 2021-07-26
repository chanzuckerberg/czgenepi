import json
import os
import re
import uuid
from typing import Any, Callable, Iterable, Mapping, MutableSequence, Set, Tuple, Union

import boto3
import sqlalchemy
from flask import g, jsonify, make_response, Response
from sqlalchemy import func, or_
from sqlalchemy.orm import aliased, joinedload, Session

from aspen.app.app import application, requires_auth
from aspen.app.views.api_utils import format_datetime
from aspen.database.models import (
    DataType,
    PhyloRun,
    PhyloTree,
    PhyloTreeSamples,
    Sample,
    WorkflowStatusType,
)
from aspen.database.models.usergroup import User
from aspen.error.recoverable import RecoverableError
from aspen.phylo_tree.identifiers import rename_nodes_on_tree

PHYLO_TREE_KEY = "phylo_trees"


def humanize_tree_name(s3_key: str):
    json_filename = s3_key.split("/")[-1]
    basename = re.sub(r".json", "", json_filename)
    title_case = basename.replace("_", " ").title()
    if "Ancestors" in title_case:
        title_case = title_case.replace("Ancestors", "Contextual")
    if " Public" in title_case:
        title_case = title_case.replace(" Public", "")
    if " Private" in title_case:
        title_case = title_case.replace(" Private", "")
    return title_case


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
        .options(joinedload(phylo_run_alias.outputs))
        .filter(
            or_(
                user.system_admin,
                phylo_run_alias.group_id == user.group.id,
                phylo_run_alias.group_id.in_(cansee_owner_group_ids),
            )
        )
        .filter(phylo_run_alias.workflow_status == WorkflowStatusType.COMPLETED)
    )

    # filter for only information we need in sample table view
    results: MutableSequence[Mapping[str, Any]] = list()
    for phylo_run in phylo_runs:
        phylo_tree: PhyloTree
        for output in phylo_run.outputs:
            if isinstance(output, PhyloTree):
                phylo_tree = output
                break
        else:
            raise RecoverableError(
                f"phylo run (workflow id={phylo_run.workflow_id}) does not have a"
                " phylo tree output."
            )
        results.append(
            {
                "phylo_tree_id": phylo_tree.entity_id,
                "name": humanize_tree_name(phylo_tree.s3_key),
                "pathogen_genome_count": 0,  # Leaving this field in place temporarily for reverse-compatibility
                "completed_date": format_datetime(phylo_run.end_datetime),
            }
        )

    return jsonify({PHYLO_TREE_KEY: results})


def _process_phylo_tree(
    db_session: Session, phylo_tree_id: int, user: User
) -> Union[dict, Response]:
    """Retrieves a phylo tree and renames the nodes on the tree for a given user."""
    can_see_group_ids_trees: Set[int] = {user.group_id}
    can_see_group_ids_trees.update(
        {
            can_see.owner_group_id
            for can_see in user.group.can_see
            if can_see.data_type == DataType.TREES
        }
    )

    try:
        phylo_tree: PhyloTree = (
            db_session.query(PhyloTree)
            .join(PhyloRun)
            .filter(PhyloTree.entity_id == phylo_tree_id)
            .filter(
                or_(
                    user.system_admin,
                    PhyloRun.group_id.in_(can_see_group_ids_trees),
                )
            )
            .options(joinedload(PhyloTree.constituent_samples))
            .one()
        )
    except sqlalchemy.exc.NoResultFound:  # type: ignore
        return Response(
            f"PhyloTree with id {phylo_tree_id} not viewable by user with id: {user.id}",
            400,
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

    # TODO: add a per-process shared AWS handle.
    s3 = boto3.resource("s3")

    data = (
        s3.Bucket(phylo_tree.s3_bucket).Object(phylo_tree.s3_key).get()["Body"].read()
    )
    json_data = json.loads(data)

    rename_nodes_on_tree([json_data["tree"]], identifier_map, "GISAID_ID")

    return json_data


@application.route("/api/phylo_tree/<int:phylo_tree_id>", methods=["GET"])
@requires_auth
def phylo_tree(phylo_tree_id: int):
    phylo_tree_data = _process_phylo_tree(g.db_session, phylo_tree_id, g.auth_user)

    # check if the security check failed
    if isinstance(phylo_tree_data, Response):
        # return failed response
        return phylo_tree_data

    else:
        response = make_response(phylo_tree_data)
        response.headers["Content-Type"] = "application/json"
        response.headers[
            "Content-Disposition"
        ] = f"attachment; filename={phylo_tree_id}.json"

        return response


def _extract_accessions(accessions_list: list, node: dict):
    node_attributes = node["node_attrs"]
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
    # check if the security check failed
    if isinstance(phylo_tree_data, Response):
        # return failed response
        return phylo_tree_data

    else:
        accessions = _extract_accessions([], phylo_tree_data["tree"])
        tsv_accessions = "Sample Identifier\n" + "\n".join(accessions)

        response = make_response(tsv_accessions)
        response.headers["Content-Type"] = "text/tsv"
        response.headers[
            "Content-Disposition"
        ] = f"attachment; filename={phylo_tree_id}_sample_ids.tsv"

        return response


@application.route("/api/auspice/view/<int:phylo_tree_id>", methods=["GET"])
@requires_auth
def auspice_view(phylo_tree_id: int):
    phylo_tree_data = _process_phylo_tree(g.db_session, phylo_tree_id, g.auth_user)

    # check if the security check failed
    if isinstance(phylo_tree_data, Response):
        # return failed response
        return phylo_tree_data

    else:
        s3_resource = boto3.resource(
            "s3",
            endpoint_url=os.getenv("BOTO_ENDPOINT_URL") or None,
            config=boto3.session.Config(signature_version="s3v4"),
        )
        s3_bucket = application.aspen_config.EXTERNAL_AUSPICE_BUCKET
        s3_key = str(uuid.uuid4())
        s3_resource.Bucket(s3_bucket).Object(s3_key).put(
            Body=json.dumps(phylo_tree_data)
        )
        s3_client = s3_resource.meta.client

        presigned_url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": s3_bucket, "Key": s3_key},
            ExpiresIn=3600,
        )

        return jsonify({"url": presigned_url})
