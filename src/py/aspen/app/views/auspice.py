import os
import logging
logger = logging.getLogger(__name__)

from typing import Iterable, Tuple

import boto3
from flask import make_response
from sqlalchemy.orm import joinedload

from aspen.app.app import application
from aspen.database.connection import session_scope
from aspen.database.models import (
    PhyloRun,
    PhyloTree,
    WorkflowStatusType,
)

@application.route("/api/auspice/view/<int:phylo_tree_id>/auspice.json", methods=["GET"])
def auspice_view(phylo_tree_id: int):
    with session_scope(application.DATABASE_INTERFACE) as db_session:
        phylo_runs: Iterable[Tuple[PhyloRun, int]] = (
            db_session.query(PhyloRun)
            .options(joinedload(PhyloRun.outputs))
            .filter(PhyloRun.workflow_status == WorkflowStatusType.COMPLETED)
        )

        phylo_tree: PhyloTree
        for phylo_run in phylo_runs:
            for output in phylo_run.outputs:
                if isinstance(output, PhyloTree) and output.entity_id == phylo_tree_id:
                    phylo_tree = output
                    found = True
                    break

        s3_client = boto3.resource(
            "s3",
            endpoint_url=os.getenv("BOTO_ENDPOINT_URL") or None,
            config=boto3.session.Config(signature_version="s3v4")
            )

        s3_object = s3_client.Object(phylo_tree.s3_bucket, phylo_tree.s3_key)
        content = s3_object.get()['Body'].read().decode('utf-8')

        response = make_response(content)
        response.headers['Content-Type'] = 'text/json'
        response.headers['Content-Disposition'] = 'attachment; filename=auspice.json'
        return response
