from typing import Any, Iterable, Mapping, MutableSequence, Set

from flask import jsonify, session
from sqlalchemy import or_
from sqlalchemy.orm import joinedload

from aspen.app.app import application, requires_auth
from aspen.app.views import api_utils
from aspen.app.views.api_utils import get_usergroup_query
from aspen.database.connection import session_scope
from aspen.database.models import (
    DataType,
    PublicRepositoryType,
    SequencingReadsCollection,
    UploadedPathogenGenome,
)
from aspen.database.models.sample import Sample
from aspen.database.models.usergroup import Group, User


def _format_created_date(sample: Sample) -> str:
    if sample.sequencing_reads_collection is not None:
        return api_utils.format_datetime(sample.sequencing_reads_collection.upload_date)
    elif sample.uploaded_pathogen_genome is not None:
        return api_utils.format_datetime(sample.uploaded_pathogen_genome.upload_date)
    else:
        return "not yet uploaded"


def _format_gisaid_accession(sample: Sample) -> str:
    if sample.uploaded_pathogen_genome is not None:
        for accession in sample.uploaded_pathogen_genome.accessions:
            if accession.repository_type == PublicRepositoryType.GISAID:
                return accession.public_identifier
    if sample.sequencing_reads_collection is not None:
        for accession in sample.sequencing_reads_collection.accessions:
            if accession.repository_type == PublicRepositoryType.GISAID:
                return accession.public_identifier
    return "NOT SUBMITTED"


@application.route("/api/samples", methods=["GET"])
@requires_auth
def samples():
    with session_scope(application.DATABASE_INTERFACE) as db_session:
        profile = session["profile"]

        user = (
            get_usergroup_query(db_session, profile["user_id"])
            .options(joinedload(User.group, Group.can_see))
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

        sequencing_reads: Iterable[Sample] = (
            db_session.query(Sample)
            .options(
                joinedload(
                    Sample.uploaded_pathogen_genome, UploadedPathogenGenome.accessions
                ),
                joinedload(
                    Sample.sequencing_reads_collection,
                    SequencingReadsCollection.accessions,
                ),
            )
            .filter(
                or_(
                    Sample.submitting_group_id == user.group_id,
                    Sample.submitting_group_id.in_(cansee_groups_metadata),
                )
            )
        )

        # filter for only information we need in sample table view
        results: MutableSequence[Mapping[str, Any]] = list()
        for sample in sequencing_reads:
            returned_sample_data = {
                "public_identifier": sample.public_identifier,
                "upload_date": _format_created_date(sample),
                "collection_date": api_utils.format_date(sample.collection_date),
                "collection_location": sample.location,
                "gisaid": _format_gisaid_accession(sample),
            }

            if (
                sample.submitting_group_id == user.group_id
                or sample.submitting_group_id in cansee_groups_private_identifiers
            ):
                returned_sample_data["private_identifier"] = sample.private_identifier

            results.append(returned_sample_data)

        return jsonify(results)
