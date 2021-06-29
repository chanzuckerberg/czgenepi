import datetime
import tempfile
from collections import defaultdict
from typing import (
    Any,
    Iterable,
    Mapping,
    MutableSequence,
    Optional,
    Sequence,
    Set,
    Union,
)

from flask import jsonify, request, Response, send_file, session
from sqlalchemy import and_, or_
from sqlalchemy.orm import joinedload

from aspen.app.app import application, requires_auth
from aspen.app.views import api_utils
from aspen.app.views.api_utils import check_valid_sequence, get_usergroup_query
from aspen.database.connection import session_scope
from aspen.database.models import (
    DataType,
    Entity,
    GisaidAccession,
    GisaidAccessionWorkflow,
    PublicRepositoryType,
    Sample,
    UploadedPathogenGenome,
    WorkflowStatusType,
)
from aspen.database.models.sample import create_public_ids, RegionType
from aspen.database.models.usergroup import Group, User
from aspen.error.recoverable import RecoverableError

DEFAULT_DIVISION = "California"
DEFAULT_COUNTRY = "USA"
DEFAULT_ORGANISM = "Severe acute respiratory syndrome coronavirus 2"
SAMPLE_KEY = "samples"
GISIAD_REJECTION_TIME = datetime.timedelta(days=4)
SAMPLES_POST_REQUIRED_FIELDS = [
    "private",
    "private_identifier",
    "collection_date",
    "location",
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
    "division",
    "country",
    "region",
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


def _format_created_date(sample: Sample) -> str:
    if sample.sequencing_reads_collection is not None:
        return api_utils.format_date(sample.sequencing_reads_collection.upload_date)
    elif sample.uploaded_pathogen_genome is not None:
        return api_utils.format_date(sample.uploaded_pathogen_genome.upload_date)
    elif sample.czb_failed_genome_recovery:
        return api_utils.format_datetime(None)
    else:
        return "not yet uploaded"


def _format_gisaid_accession(
    sample: Sample,
    entity_id_to_gisaid_accession_workflow_map: defaultdict[
        int, list[GisaidAccessionWorkflow]
    ],
) -> Mapping[str, Optional[str]]:
    if sample.czb_failed_genome_recovery:
        # todo need to add the private option here for v3 a user uploads and flags a private sample
        return {"status": "Not Eligible", "gisaid_id": None}

    uploaded_entity = sample.get_uploaded_entity()
    gisaid_accession_workflows = entity_id_to_gisaid_accession_workflow_map.get(
        uploaded_entity.entity_id, []
    )
    for gisaid_accession_workflow in gisaid_accession_workflows:
        if gisaid_accession_workflow.workflow_status == WorkflowStatusType.COMPLETED:
            # hey there should be an output...
            for output in gisaid_accession_workflow.outputs:
                assert isinstance(output, GisaidAccession)
                if not output.public_identifier:
                    return {
                        "status": "Submitted",
                        "gisaid_id": "Not Provided",
                    }
                return {
                    "status": "Accepted",
                    "gisaid_id": output.public_identifier,
                }
            else:
                raise RecoverableError(
                    "Successful accession workflow for sample"
                    f" {sample.public_identifier} does not seem to have an accession"
                    " output."
                )

        date_since_submitted = (
            datetime.date.today() - gisaid_accession_workflow.start_datetime.date()
        )
        if date_since_submitted < GISIAD_REJECTION_TIME:
            return {"status": "Submitted", "gisaid_id": None}
        else:
            return {"status": "Rejected", "gisaid_id": None}
    return {"status": "Not Yet Submitted", "gisaid_id": None}


def _format_lineage(sample: Sample) -> dict[str, Any]:
    pathogen_genome = sample.uploaded_pathogen_genome
    if pathogen_genome:
        lineage = {
            "lineage": pathogen_genome.pangolin_lineage,
            "probability": pathogen_genome.pangolin_probability,
            "version": pathogen_genome.pangolin_version,
            "last_updated": api_utils.format_date(
                pathogen_genome.pangolin_last_updated
            ),
        }
    else:
        lineage = {
            "lineage": None,
            "probability": None,
            "version": None,
            "last_updated": None,
        }

    return lineage


@application.route("/api/sequences", methods=["GET"])
@requires_auth
def prepare_sequences_download():
    with session_scope(application.DATABASE_INTERFACE) as db_session:
        profile = session["profile"]
        user = (
            get_usergroup_query(db_session, profile["user_id"])
            .options(joinedload(User.group).joinedload(Group.can_see))
            .one()
        )
        request_data = request.get_json()
        sample_ids = request_data["requested_sequences"]["sample_ids"]

        # query for samples
        all_samples: Iterable[Sample] = (
            db_session.query(Sample)
            .filter(
                and_(
                    Sample.uploaded_pathogen_genome != None,  # noqa: E711
                    or_(
                        Sample.private_identifier.in_(sample_ids),
                        Sample.public_identifier.in_(sample_ids),
                    ),
                )
            )
            .options(
                joinedload(Sample.uploaded_pathogen_genome).undefer(
                    UploadedPathogenGenome.sequence
                ),
            )
        )
        # check that user has access to the samples
        group_ids = set(sample.submitting_group_id for sample in all_samples)
        cansee_groups: Set[int] = {
            cansee.owner_group_id
            for cansee in user.group.can_see
            if cansee.data_type == DataType.SEQUENCES
        }
        # add the users own group
        cansee_groups.add(user.group_id)
        if not group_ids.issubset(cansee_groups):
            return Response(
                "User does not have access the requested sequences",
                400,
            )

        cansee_groups_private_identifiers: Set[int] = {
            cansee.owner_group_id
            for cansee in user.group.can_see
            if cansee.data_type == DataType.PRIVATE_IDENTIFIERS
        }
        # create output file
        fasta_file = tempfile.NamedTemporaryFile("w+t")
        with open(fasta_file.name, "w") as f:
            for sample in all_samples:
                if sample.uploaded_pathogen_genome:
                    pathogen_genome: UploadedPathogenGenome = (
                        sample.uploaded_pathogen_genome
                    )
                    sequence: str = "".join(
                        [
                            line
                            for line in pathogen_genome.sequence.splitlines()  # type: ignore
                            if not (line.startswith(">") or line.startswith(";"))
                        ]
                    )
                    stripped_sequence: str = sequence.strip("Nn")
                    # use private id if the user has access to it, else public id
                    if (
                        sample.submitting_group_id == user.group_id
                        or sample.submitting_group_id
                        in cansee_groups_private_identifiers
                        or user.system_admin
                    ):
                        f.write(f">{sample.private_identifier}\n")  # type: ignore
                    else:
                        f.write(f">{sample.public_identifier}\n")
                    f.write(stripped_sequence)
                    f.write("\n")

        fasta_filename = f"{user.group.name}_sample_sequences.fasta"
        res = send_file(
            fasta_file, attachment_filename=fasta_filename, as_attachment=True
        )
        # remove the file
        f.close()
        return res


@application.route("/api/samples", methods=["GET"])
@requires_auth
def samples():
    with session_scope(application.DATABASE_INTERFACE) as db_session:
        profile = session["profile"]
        user = (
            get_usergroup_query(db_session, profile["user_id"])
            .options(joinedload(User.group).joinedload(Group.can_see))
            .one()
        )

        cansee_groups_metadata: Set[int] = {
            cansee.owner_group_id
            for cansee in user.group.can_see
            if cansee.data_type == DataType.METADATA
        }
        cansee_groups_private_identifiers: Set[int] = {
            cansee.owner_group_id
            for cansee in user.group.can_see
            if cansee.data_type == DataType.PRIVATE_IDENTIFIERS
        }

        # load the samples.
        samples: Sequence[Sample] = (
            db_session.query(Sample)
            .filter(
                or_(
                    Sample.submitting_group_id == user.group_id,
                    and_(
                        Sample.submitting_group_id.in_(cansee_groups_metadata),
                        ~Sample.private,
                    ),
                    user.system_admin,
                )
            )
            .options(
                joinedload(Sample.uploaded_pathogen_genome),
                joinedload(Sample.sequencing_reads_collection),
            )
            .all()
        )
        sample_entity_ids: MutableSequence[int] = list()
        for sample in samples:
            if sample.uploaded_pathogen_genome is not None:
                sample_entity_ids.append(sample.uploaded_pathogen_genome.entity_id)

        # load the gisaid_accessioning workflows.
        gisaid_accession_workflows: Sequence[GisaidAccessionWorkflow] = (
            db_session.query(GisaidAccessionWorkflow)
            .join(GisaidAccessionWorkflow.inputs)
            .filter(Entity.id.in_(sample_entity_ids))
            .options(
                joinedload(GisaidAccessionWorkflow.inputs),
                joinedload(GisaidAccessionWorkflow.outputs.of_type(GisaidAccession)),
            )
            .all()
        )
        entity_id_to_gisaid_accession_workflow_map: defaultdict[
            int, list[GisaidAccessionWorkflow]
        ] = defaultdict(list)
        for gisaid_accession_workflow in gisaid_accession_workflows:
            for workflow_input in gisaid_accession_workflow.inputs:
                if isinstance(workflow_input, (UploadedPathogenGenome)):
                    entity_id_to_gisaid_accession_workflow_map[
                        workflow_input.entity_id
                    ].append(gisaid_accession_workflow)
        for (
            gisaid_accession_workflow_list
        ) in entity_id_to_gisaid_accession_workflow_map.values():
            # sort by success, date.
            gisaid_accession_workflow_list.sort(
                key=lambda gisaid_accession_workflow: (
                    1
                    if gisaid_accession_workflow.workflow_status
                    == WorkflowStatusType.COMPLETED
                    else 0,
                    gisaid_accession_workflow.start_datetime,
                ),
                reverse=True,
            )

        # filter for only information we need in sample table view
        results: MutableSequence[Mapping[str, Any]] = list()
        for sample in samples:
            returned_sample_data = {
                "public_identifier": sample.public_identifier,
                "upload_date": _format_created_date(sample),
                "collection_date": api_utils.format_date(sample.collection_date),
                "collection_location": sample.location,
                "gisaid": _format_gisaid_accession(
                    sample, entity_id_to_gisaid_accession_workflow_map
                ),
                "czb_failed_genome_recovery": sample.czb_failed_genome_recovery,
                "lineage": _format_lineage(sample),
                "private": sample.private,
            }

            if (
                sample.submitting_group_id == user.group_id
                or sample.submitting_group_id in cansee_groups_private_identifiers
                or user.system_admin
            ):
                returned_sample_data["private_identifier"] = sample.private_identifier

            results.append(returned_sample_data)

        return jsonify({SAMPLE_KEY: results})


@application.route("/api/samples/create", methods=["POST"])
@requires_auth
def create_sample():
    with session_scope(application.DATABASE_INTERFACE) as db_session:
        profile: Mapping[str, str] = session["profile"]

        user: User = (
            get_usergroup_query(db_session, profile["user_id"])
            .options(joinedload(User.group))
            .one()
        )
        request_data = request.get_json()

        duplicates_in_request: Union[
            None, Mapping[str, list[str]]
        ] = api_utils.check_duplicate_data_in_request(request_data)
        if duplicates_in_request:
            return Response(
                f"Error processing data, either duplicate private_identifiers: {duplicates_in_request['duplicate_private_ids']} or duplicate public identifiers: {duplicates_in_request['duplicate_public_ids']} exist in the upload files, please rename duplicates before proceeding with upload.",
                400,
            )

        already_exists: Union[
            None, Mapping[str, list[str]]
        ] = api_utils.check_duplicate_samples(request_data, db_session)
        if already_exists:
            return Response(
                f"Error inserting data, private_identifiers {already_exists['existing_private_ids']} or public_identifiers: {already_exists['existing_public_ids']} already exist in our database, please remove these samples before proceeding with upload.",
                400,
            )
        public_ids = create_public_ids(user.group_id, db_session, len(request_data))
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
                if data["sample"]["public_identifier"]:
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
                    "division": DEFAULT_DIVISION,
                    "country": DEFAULT_COUNTRY,
                    "region": RegionType.NORTH_AMERICA,
                    "organism": DEFAULT_ORGANISM,
                    "private_identifier": data["sample"]["private_identifier"],
                    "collection_date": data["sample"]["collection_date"],
                    "location": data["sample"]["location"],
                    "private": data["sample"]["private"],
                    "public_identifier": public_identifier,
                }

                if "authors" not in sample_args:
                    sample_args["authors"] = [
                        user.group.name,
                    ]

                sequence = data["pathogen_genome"]["sequence"]
                if not check_valid_sequence(sequence):
                    # make sure we don't save any samples already added to the session
                    db_session.rollback()
                    return Response(
                        f"Sample {sample_args['private_identifier']} contains invalid sequence characters, "
                        f"accepted characters are [WSKMYRVHDBNZNATCGU-]",
                        400,
                    )

                sample: Sample = Sample(**sample_args)
                uploaded_pathogen_genome: UploadedPathogenGenome = (
                    UploadedPathogenGenome(
                        sample=sample,
                        sequence=data["pathogen_genome"]["sequence"],
                        sequencing_date=api_utils.format_sequencing_date(
                            data["pathogen_genome"]["sequencing_date"]
                        ),
                    )
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

                db_session.add(sample)
                db_session.add(uploaded_pathogen_genome)

            else:
                return Response(
                    f"Missing required fields {missing_fields} or encountered unexpected fields {unexpected_fields}",
                    400,
                )
        try:
            db_session.commit()
        except Exception as e:
            return Response(f"Error encountered when saving data: {e}", 400)
        return jsonify(success=True)
