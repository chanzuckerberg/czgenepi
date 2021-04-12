import logging
import os
from typing import Optional

import boto3
from flask import make_response

from aspen.app.app import application
from aspen.database.connection import session_scope
from aspen.database.models import PhyloTree
from aspen.error.recoverable import RecoverableError

logger = logging.getLogger(__name__)


@application.route(
    "/api/auspice/view/<int:phylo_tree_id>/auspice.json", methods=["GET"]
)
def auspice_view(phylo_tree_id: int):
    with session_scope(application.DATABASE_INTERFACE) as db_session:
        phylo_tree: Optional[PhyloTree] = (
            db_session.query(PhyloTree)
            .filter(PhyloTree.entity_id == phylo_tree_id)
            .one_or_none()
        )

        if not phylo_tree:
            raise RecoverableError(f"Phylo Tree {phylo_tree_id} not found.")

        s3_client = boto3.resource(
            "s3",
            endpoint_url=os.getenv("BOTO_ENDPOINT_URL") or None,
            config=boto3.session.Config(signature_version="s3v4"),
        )

        s3_object = s3_client.Object(phylo_tree.s3_bucket, phylo_tree.s3_key)
        content = s3_object.get()["Body"].read().decode("utf-8")

        response = make_response(content)
        response.headers["Content-Type"] = "text/json"
        response.headers["Content-Disposition"] = "attachment; filename=auspice.json"
        return response
