from typing import Iterable

from flask import jsonify, session
from sqlalchemy.orm import joinedload

from aspen.app.app import application, requires_auth
from aspen.app.views import api_utils
from aspen.database.connection import session_scope
from aspen.database.models.sample import Sample
from aspen.database.models.usergroup import Group, User


def _format_created_date(sample: Sample) -> str:
    if sample.sequencing_reads_collection is not None:
        return api_utils.format_datetime(sample.sequencing_reads_collection.upload_date)
    elif sample.uploaded_pathogen_genome is not None:
        return api_utils.format_datetime(sample.uploaded_pathogen_genome.upload_date)
    else:
        return "not yet uploaded"


@application.route("/api/samples", methods=["GET"])
@requires_auth
def samples():
    with session_scope(application.DATABASE_INTERFACE) as db_session:
        profile = session["profile"]
        sequencing_reads: Iterable[Sample] = (
            db_session.query(Sample)
            .join(Group, User)
            .options(
                joinedload(Sample.uploaded_pathogen_genome),
                joinedload(Sample.sequencing_reads_collection),
            )
            .filter(User.auth0_user_id == profile["user_id"])
        )

        # filter for only information we need in sample table view
        filtered_sample_data = [
            {
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": _format_created_date(sample),
                "collection_date": api_utils.format_date(sample.collection_date),
                "collection_location": sample.location,
            }
            for sample in sequencing_reads
        ]

        return jsonify(filtered_sample_data)
