import datetime
import sys
from collections import defaultdict
from typing import Any, Mapping, MutableSequence, Optional, Sequence, Set, Union

from flask import jsonify, request, Response, session
from sqlalchemy import or_
from sqlalchemy.orm import joinedload

from aspen.app.app import application, requires_auth
from aspen.app.views import api_utils
from aspen.app.views.api_utils import get_usergroup_query
from aspen.database.connection import session_scope
from aspen.database.models import (
    AlignRead,
    Bam,
    CallConsensus,
    CalledPathogenGenome,
    DataType,
    Entity,
    FilterRead,
    GisaidAccession,
    GisaidAccessionWorkflow,
    HostFilteredSequencingReadsCollection,
    PublicRepositoryType,
    Sample,
    SequencingReadsCollection,
    UploadedPathogenGenome,
    WorkflowStatusType,
)
from aspen.database.models.sample import create_public_ids, RegionType
from aspen.database.models.usergroup import Group, User
from aspen.error.recoverable import RecoverableError

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
                    Sample.submitting_group_id.in_(cansee_groups_metadata),
                    user.system_admin,
                )
            )
            .options(
                joinedload(Sample.uploaded_pathogen_genome),
                joinedload(Sample.sequencing_reads_collection)
                .joinedload(
                    SequencingReadsCollection.consuming_workflows.of_type(FilterRead)
                )
                .joinedload(
                    FilterRead.outputs.of_type(HostFilteredSequencingReadsCollection)
                )
                .joinedload(
                    HostFilteredSequencingReadsCollection.consuming_workflows.of_type(
                        AlignRead
                    )
                )
                .joinedload(AlignRead.outputs.of_type(Bam))
                .joinedload(Bam.consuming_workflows.of_type(CallConsensus))
                .joinedload(CallConsensus.outputs.of_type(CalledPathogenGenome)),
            )
            .all()
        )
        sample_entity_ids: MutableSequence[int] = list()
        for sample in samples:
            if sample.uploaded_pathogen_genome is not None:
                sample_entity_ids.append(sample.uploaded_pathogen_genome.entity_id)
            elif sample.sequencing_reads_collection is not None:
                # TODO: get the best called pathogen genome for the sequencing read
                # collection.
                ...

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
                if isinstance(
                    workflow_input, (UploadedPathogenGenome, SequencingReadsCollection)
                ):
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

        already_exists: Union[
            None, Mapping[str, list[str]]
        ] = api_utils.check_duplicate_samples(request_data, db_session)
        if already_exists:
            return Response(
                f"Duplicate fields found in db private_identifiers {already_exists['existing_private_ids']} and public_identifiers: {already_exists['existing_public_ids']}",
                400,
            )
        public_ids = create_public_ids(user.group_id, db_session, len(request_data))
        sys.stdout.write(f"PUBLIC IDS: {public_ids}")

        samples_for_upload = []
        pathogen_genomes_for_upload = []
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
                sample_args: Mapping[str, Any] = {
                    "submitting_group": user.group,
                    "uploaded_by": user,
                    "sample_collected_by": user.group.name,
                    "sample_collector_contact_address": user.group.address,
                    "division": "California",
                    "country": "USA",
                    "region": RegionType.NORTH_AMERICA,
                    "organism": "Severe acute respiratory syndrome coronavirus 2",
                    "private_identifier": data["sample"]["private_identifier"],
                    "collection_date": data["sample"]["collection_date"],
                    "location": data["sample"]["location"],
                }

                if data["sample"]["public_identifier"] != "":
                    # check that this is not an empty string
                    sample_args["public_identifier"] = data["sample"][
                        "public_identifier"
                    ]
                else:
                    sample_args["public_identifier"] = public_ids.pop(0)

                if "authors" not in sample_args:
                    sample_args["authors"] = [
                        user.group.name,
                    ]

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

                samples_for_upload.append(sample)
                pathogen_genomes_for_upload.append(uploaded_pathogen_genome)

            else:
                return Response(
                    f"Missing required fields {missing_fields} or encountered unexpected fields {unexpected_fields}",
                    400,
                )
        # todo add try catch here
        # don't persist the changes unless all models save successfully
        try:
            db_session.add_all(samples_for_upload)
            db_session.add_all(pathogen_genomes_for_upload)
            db_session.commit()
        except Exception as e:
            sys.stdout.write(f"ERROR encountered {e}")
            db_session.rollback()
            return Response(f"Error encountered when saving data: {e}", 400)

        return jsonify(success=True)
