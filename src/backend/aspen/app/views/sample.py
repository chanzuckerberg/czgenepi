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
from sqlalchemy import and_
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
from aspen.database.models import (
    Location,
    PublicRepositoryType,
    Sample,
    UploadedPathogenGenome,
)
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
    "isl_access_number",
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
                submitted_to_gisaid = True
                public_identifier = data["sample"]["public_identifier"]
            else:
                # if they did not mark true to "submitted to gisaid generate a new public id for
                # them
                submitted_to_gisaid = False
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
            if data["pathogen_genome"]["isl_access_number"]:
                uploaded_pathogen_genome.add_accession(
                    repository_type=PublicRepositoryType.GISAID,
                    public_identifier=data["pathogen_genome"]["isl_access_number"],
                    workflow_start_datetime=datetime.datetime.now(),
                    workflow_end_datetime=datetime.datetime.now(),
                )
            elif submitted_to_gisaid:
                # in this scenario they've checked yes to previously submitted to GISAID but did
                # not provide an isl-number, we mark it as UNKNOWN for now.
                uploaded_pathogen_genome.add_accession(
                    repository_type=PublicRepositoryType.GISAID,
                    public_identifier=None,
                    workflow_start_datetime=datetime.datetime.now(),
                    workflow_end_datetime=datetime.datetime.now(),
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


@application.route("/api/samples/update/publicids", methods=["POST"])
@requires_auth
def update_sample_public_ids():
    user: User = g.auth_user
    request_data = request.get_json()

    if not user.system_admin:
        raise ex.BadRequestException(
            "user making update request must be a system admin",
        )

    private_to_public: Mapping[str, str] = request_data["id_mapping"]
    request_private_ids: list[str] = private_to_public.keys()
    request_public_ids: list[str] = private_to_public.values()

    group_id: int = request_data["group_id"]

    # check that all private_identifiers exist
    existing_private_ids: list[str] = api_utils.get_existing_private_ids(
        request_private_ids, g.db_session, group_id=group_id
    )
    missing_private_identifiers = [
        s for s in request_private_ids if s not in existing_private_ids
    ]
    if missing_private_identifiers:
        raise ex.BadRequestException(
            f"Private Identifiers {missing_private_identifiers} not found in DB",
        )

    samples_to_update = g.db_session.query(Sample).filter(
        and_(
            Sample.submitting_group_id == group_id,
            Sample.private_identifier.in_(private_to_public.keys()),
        )
    )

    # check that public_identifiers don't already exist
    existing_public_ids: list[str] = api_utils.get_existing_public_ids(
        request_public_ids, g.db_session, group_id=group_id
    )
    if existing_public_ids:
        raise ex.BadRequestException(
            f"Public Identifiers {existing_public_ids} are already in the database",
        )

    for s in samples_to_update.all():
        s.public_identifier = private_to_public[s.private_identifier]
        g.db_session.add(s)

    g.db_session.commit()
    return jsonify(success=True)


@application.route("/api/samples/validate-ids", methods=["POST"])
@requires_auth
def validate_ids():
    """
    take in a list of identifiers and checks if all idenitifiers exist as either Sample public or private identifiers, or GisaidMetadata strain names

    returns a response with list of missing identifiers if any, otherwise will return an empty list
    """

    user = g.auth_user

    validator = ValidateIDsRequestSchema()
    request_json = request.get_json()

    try:
        request_data = validator.load(request_json)
    except ValidationError as verr:
        sentry_sdk.capture_message("Invalid API request to /api/validate/ids", "info")
        raise ex.BadRequestException(str(verr))

    sample_ids: Iterable[str] = request_data["sample_ids"]

    all_samples: Iterable[Sample] = g.db_session.query(Sample)

    # get all samples from request that the user has permission to use and scope down the search for matching ID's to groups that the user has read access to.
    user_visible_samples: Query = authz_sample_filters(all_samples, sample_ids, user)

    # Are there any sample ID's that don't match sample table public and private identifiers
    missing_sample_ids: Set[str]
    missing_sample_ids, _ = get_missing_and_found_sample_ids(
        sample_ids, user_visible_samples
    )

    # See if these missing_sample_ids match any Gisaid identifiers
    gisaid_ids: Set[str] = get_matching_gisaid_ids(missing_sample_ids, g.db_session)

    # Do we have any samples that are not aspen private or public identifiers or gisaid identifiers?
    missing_sample_ids: Set[str] = missing_sample_ids - gisaid_ids

    responseschema = ValidateIDsResponseSchema()

    response = make_response(
        responseschema.dumps({"missing_sample_ids": missing_sample_ids}), 200
    )
    response.headers["Content-Type"] = "application/json"
    return response
