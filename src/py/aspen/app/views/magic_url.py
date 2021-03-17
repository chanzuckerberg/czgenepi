import json
from urllib.parse import urlparse, parse_qsl

import boto3
from flask import jsonify, session, request, url_for, redirect

from aspen.app.app import application, requires_auth
from aspen.database.connection import session_scope
from aspen.database.models import (
    PhyloRun,
    PhyloTree,
)

MAGIC_URL_KEY = "magic_url"
MAGIC_TYPES = { "phylo_tree": PhyloTree }

@application.route("/api/magic_url/<string:query_string>/<path:location>", methods=["GET"])
def magic_url(query_string, location):
    return redirect(f'https://{location}?{query_string}')

@application.route("/api/get_magic_url/<string:object_name>/<int:object_id>", methods=["GET"])
@requires_auth
def get_magic_url(object_name: str, object_id: int):
    object_type = MAGIC_TYPES.get(object_name)
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
        netloc_path = parse_result.netloc + parse_result.path

        magic_url_string = url_for("magic_url", _external=True, query_string=parse_result.query, location=netloc_path)

        return jsonify({MAGIC_URL_KEY: { "url": magic_url_string }})
