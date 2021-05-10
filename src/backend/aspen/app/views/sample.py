import datetime
from collections import defaultdict
from typing import Any, Mapping, MutableSequence, Optional, Sequence, Set

from flask import jsonify, session
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
    SequencingReadsCollection,
    UploadedPathogenGenome,
    WorkflowStatusType,
)
from aspen.database.models.sample import Sample
from aspen.database.models.usergroup import Group, User
from aspen.error.recoverable import RecoverableError

SAMPLE_KEY = "samples"
GISIAD_REJECTION_TIME = datetime.timedelta(days=4)


def _format_created_date(sample: Sample) -> str:
    if sample.sequencing_reads_collection is not None:
        return api_utils.format_datetime(sample.sequencing_reads_collection.upload_date)
    elif sample.uploaded_pathogen_genome is not None:
        return api_utils.format_datetime(sample.uploaded_pathogen_genome.upload_date)
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
        return {"status": "not_eligible", "gisaid_id": None}

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
                    "status": "accepted",
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
            return {"status": "submitted", "gisaid_id": None}
        else:
            return {"status": "rejected", "gisaid_id": None}
    return {"status": "no_info", "gisaid_id": None}


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
            }

            if (
                sample.submitting_group_id == user.group_id
                or sample.submitting_group_id in cansee_groups_private_identifiers
                or user.system_admin
            ):
                returned_sample_data["private_identifier"] = sample.private_identifier

            results.append(returned_sample_data)

        return jsonify({SAMPLE_KEY: results})
