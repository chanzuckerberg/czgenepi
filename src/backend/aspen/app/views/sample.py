import datetime
import json
import os
import re
import threading
from typing import Any, Iterable, Mapping, Optional, Sequence, Set, Union
from uuid import uuid4

import boto3
import sentry_sdk
import smart_open
from flask import g, jsonify, make_response, request, Response, stream_with_context
from marshmallow.exceptions import ValidationError
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.orm.query import Query

from aspen import aws
from aspen.app.app import application, requires_auth
from aspen.app.serializers import ValidateIDsRequestSchema, ValidateIDsResponseSchema
from aspen.app.views import api_utils
from aspen.app.views.api_utils import (
    authz_sample_filters,
    check_valid_sequence,
    get_matching_gisaid_ids,
    get_missing_and_found_sample_ids,
)
from aspen.database.connection import session_scope
from aspen.database.models import Location, Sample, UploadedPathogenGenome
from aspen.database.models.sample import create_public_ids
from aspen.database.models.usergroup import Group, User
from aspen.error import http_exceptions as ex
from aspen.fileio.fasta_streamer import FastaStreamer

DEFAULT_DIVISION = "California"
DEFAULT_COUNTRY = "USA"
DEFAULT_ORGANISM = "Severe acute respiratory syndrome coronavirus 2"
SAMPLE_KEY = "samples"
GISAID_REJECTION_TIME = datetime.timedelta(days=4)
SAMPLES_POST_REQUIRED_FIELDS = [
    "private",
    "private_identifier",
    "collection_date",
    "location_id",
    # following fields from PathogenGenome
    "sequence",
]
SAMPLES_POST_OPTIONAL_FIELDS = [
    "original_submission",
    "public_identifier",
    "sample_collected_by",
    "sample_collector_contact_email",
    "sample_collector_contact_address",
    "authors",
    "organism",
    "host",
    "purpose_of_sampling",
    "specimen_processing",
    "czb_failed_genome_recovery",
    # following fields from PathogenGenome
    "sequencing_date",
    "sequencing_depth",
]


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


def _kick_off_pangolin(group_prefix: str, sample_ids: Sequence[str]):
    sfn_params = application.aspen_config.AWS_PANGOLIN_SFN_PARAMETERS
    sfn_input_json = {
        "Input": {
            "Run": {
                "aws_region": aws.region(),
                "docker_image_id": sfn_params["Input"]["Run"]["docker_image_id"],
                "samples": sample_ids,
                "remote_dev_prefix": os.getenv("REMOTE_DEV_PREFIX"),
                "genepi_config_secret_name": os.environ.get(
                    "GENEPI_CONFIG_SECRET_NAME", "genepi-config"
                ),
            },
        },
        "OutputPrefix": f"{sfn_params['OutputPrefix']}",
        "RUN_WDL_URI": sfn_params["RUN_WDL_URI"],
        "RunEC2Memory": sfn_params["RunEC2Memory"],
        "RunEC2Vcpu": sfn_params["RunEC2Vcpu"],
        "RunSPOTMemory": sfn_params["RunSPOTMemory"],
        "RunSPOTVcpu": sfn_params["RunSPOTVcpu"],
    }

    session = aws.session()
    client = session.client(
        service_name="stepfunctions",
        endpoint_url=os.getenv("BOTO_ENDPOINT_URL") or None,
    )

    execution_name = f"{group_prefix}-ondemand-pangolin-{str(datetime.datetime.now())}"
    execution_name = re.sub(r"[^0-9a-zA-Z-]", r"-", execution_name)

    client.start_execution(
        stateMachineArn=sfn_params["StateMachineArn"],
        name=execution_name,
        input=json.dumps(sfn_input_json),
    )


@application.route("/api/samples/create", methods=["POST"])
@requires_auth
def create_sample():
    user: User = g.auth_user
    group: Group = user.group
    request_data = request.get_json()

    duplicates_in_request: Union[
        None, Mapping[str, list[str]]
    ] = api_utils.check_duplicate_data_in_request(request_data)
    if duplicates_in_request:
        raise ex.BadRequestException(
            f"Error processing data, either duplicate private_identifiers: {duplicates_in_request['duplicate_private_ids']} or duplicate public identifiers: {duplicates_in_request['duplicate_public_ids']} exist in the upload files, please rename duplicates before proceeding with upload.",
        )

    already_exists: Union[
        None, Mapping[str, list[str]]
    ] = api_utils.check_duplicate_samples(request_data, g.db_session, user.group_id)
    if already_exists:
        raise ex.BadRequestException(
            f"Error inserting data, private_identifiers {already_exists['existing_private_ids']} or public_identifiers: {already_exists['existing_public_ids']} already exist in our database, please remove these samples before proceeding with upload.",
        )
    public_ids = create_public_ids(user.group_id, g.db_session, len(request_data))
    pangolin_sample_ids: Sequence[str] = []  # Pass sample public ids to pangolin job
    for data in request_data:
        data_ok: bool
        missing_fields: Optional[list[str]]
        unexpected_fields: Optional[list[str]]
        data_ok, missing_fields, unexpected_fields = api_utils.check_data(
            list(data["sample"].keys()),
            list(data["pathogen_genome"].keys()),
            SAMPLES_POST_REQUIRED_FIELDS,
            SAMPLES_POST_OPTIONAL_FIELDS,
        )
        if data_ok:
            # GISAID Stuff
            public_identifier = data["sample"].get("public_identifier")
            if public_identifier:
                # if they provided a public_id they marked true to "submitted to gisaid"
                public_identifier = data["sample"]["public_identifier"]
            else:
                # if they did not mark true to "submitted to gisaid generate a new public id for
                # them
                public_identifier = public_ids.pop(0)

            sample_args: Mapping[str, Any] = {
                "submitting_group": user.group,
                "uploaded_by": user,
                "sample_collected_by": user.group.name,
                "sample_collector_contact_address": user.group.address,
                "organism": DEFAULT_ORGANISM,
                "private_identifier": data["sample"]["private_identifier"],
                "collection_date": data["sample"]["collection_date"],
                "private": data["sample"]["private"],
                "public_identifier": public_identifier,
            }

            if "authors" not in sample_args:
                sample_args["authors"] = [
                    user.group.name,
                ]

            location_id = data["sample"].get("location_id", None)
            if not location_id:
                sentry_sdk.capture_message("No location_id submitted for sample")
                raise ex.BadRequestException("No location_id submitted for sample")
            valid_location: Optional[Location] = None
            try:
                valid_location = (
                    g.db_session.query(Location)
                    .filter(Location.id == location_id)
                    .one()
                )
            except NoResultFound:
                sentry_sdk.capture_message(f"No valid location for id {location_id}")
                raise ex.BadRequestException("Invalid location id for sample")

            sample_args["location_id"] = valid_location.id
            sample_args["collection_location"] = valid_location

            sequence = data["pathogen_genome"]["sequence"]
            if not check_valid_sequence(sequence):
                # make sure we don't save any samples already added to the session
                g.db_session.rollback()
                raise ex.BadRequestException(
                    f"Sample {sample_args['private_identifier']} contains invalid sequence characters, "
                    f"accepted characters are [WSKMYRVHDBNZNATCGU-]",
                )

            sample: Sample = Sample(**sample_args)
            uploaded_pathogen_genome: UploadedPathogenGenome = UploadedPathogenGenome(
                sample=sample,
                sequence=data["pathogen_genome"]["sequence"],
                sequencing_date=api_utils.format_sequencing_date(
                    data["pathogen_genome"]["sequencing_date"]
                ),
            )

            g.db_session.add(sample)
            g.db_session.add(uploaded_pathogen_genome)
            pangolin_sample_ids.append(sample.public_identifier)
        else:
            raise ex.BadRequestException(
                f"Missing required fields {missing_fields} or encountered unexpected fields {unexpected_fields}",
            )
    try:
        g.db_session.commit()
    except Exception as e:
        raise ex.BadRequestException(f"Error encountered when saving data: {e}")

    #  Run as a separate thread, so any errors here won't affect sample uploads
    pangolin_job = threading.Thread(
        target=_kick_off_pangolin, args=(group.prefix, pangolin_sample_ids)
    )
    pangolin_job.start()

    return jsonify(success=True)
