from datetime import datetime, timedelta
from typing import Any, Iterable, Mapping, MutableSequence, Optional, Set

from flask import g, jsonify
from sqlalchemy import or_
from sqlalchemy.orm import aliased, joinedload

from aspen.app.app import application, requires_auth
from aspen.app.views.api_utils import format_date, format_datetime
from aspen.database.models import DataType, PhyloRun, PhyloTree

PHYLO_TREE_KEY = "phylo_trees"


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
                    "name": phylo_tree.name,
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
