import json
from typing import Any, Iterable, Mapping, MutableSequence, Tuple
from urllib.parse import urlparse, parse_qsl

import boto3
from flask import jsonify, session, request
from sqlalchemy import func, or_
from sqlalchemy.orm import joinedload

from aspen.app.app import application, requires_auth
from aspen.app.views.api_utils import format_datetime, get_usergroup_query
from aspen.database.connection import session_scope
from aspen.database.models import (
    PhyloRun,
    PhyloTree,
)
from aspen.database.models.usergroup import Group, User
from aspen.error.recoverable import RecoverableError

PRESIGNED_URL_KEY = "presigned_url"
PRESIGNED_TYPES = { "phylo_tree": PhyloTree }

@application.route("/api/get_presigned_url/<string:object_name>/<int:object_id>", methods=["GET"])
@requires_auth
def get_presigned_url(object_name: str, object_id: int):
    object_type = PRESIGNED_TYPES.get(object_name)
    with session_scope(application.DATABASE_INTERFACE) as db_session:
        try:
            target_object = (
                db_session.query(object_type)
                .filter(object_type.entity_id == object_id)
                .one()
            )
        except:
            return jsonify({})

        s3_client = boto3.client("s3")

        presigned_url = (
            s3_client.generate_presigned_url(
                "get_object",
                Params={ "Bucket": target_object.s3_bucket, "Key": target_object.s3_key },
                ExpiresIn=300 # 5 minutes
            )
        )

        parse_result = urlparse(presigned_url)
        query_strings = parse_qsl(
            parse_result.query
        )
        query_strings.append(("path", parse_result.path))

        return jsonify({PRESIGNED_URL_KEY: dict(query_strings)})
