import os
from uuid import uuid4

import boto3
import smart_open
from flask import g, jsonify, request, Response, stream_with_context

from aspen.app.app import application, requires_auth
from aspen.database.connection import session_scope
from aspen.fileio.fasta_streamer import FastaStreamer


@application.route("/api/sequences", methods=["POST"])
@requires_auth
def prepare_sequences_download():
    # stream output file
    user = g.auth_user
    fasta_filename = f"{user.group.name}_sample_sequences.fasta"
    request_data = request.get_json()

    @stream_with_context
    def stream_samples():
        with session_scope(application.DATABASE_INTERFACE) as db_session:
            sample_ids = request_data["requested_sequences"]["sample_ids"]
            streamer = FastaStreamer(user, sample_ids, db_session)
            for line in streamer.stream():
                yield line

    # Detach all ORM objects (makes them read-only!) from the DB session for our generator.
    g.db_session.expunge_all()
    generator = stream_samples()
    resp = Response(generator, mimetype="application/binary")
    resp.headers["Content-Disposition"] = f"attachment; filename={fasta_filename}"
    return resp


@application.route("/api/sequences/getfastaurl", methods=["POST"])
@requires_auth
def getfastaurl():
    user = g.auth_user
    request_data = request.get_json()
    sample_ids = request_data["samples"]
    downstream_consumer = request_data.get("downstream_consumer")

    s3_bucket = application.aspen_config.EXTERNAL_AUSPICE_BUCKET
    s3_resource = boto3.resource(
        "s3",
        endpoint_url=os.getenv("BOTO_ENDPOINT_URL") or None,
        config=boto3.session.Config(signature_version="s3v4"),
    )
    s3_client = s3_resource.meta.client
    uuid = uuid4()
    s3_key = f"fasta-url-files/{user.group.name}/{uuid}.fasta"
    s3_write_fh = smart_open.open(
        f"s3://{s3_bucket}/{s3_key}", "w", transport_params=dict(client=s3_client)
    )
    # Write selected samples to s3
    streamer = FastaStreamer(user, sample_ids, g.db_session, downstream_consumer)
    for line in streamer.stream():
        s3_write_fh.write(line)
    s3_write_fh.close()

    presigned_url = s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": s3_bucket, "Key": s3_key},
        ExpiresIn=3600,
    )

    return jsonify({"url": presigned_url})
