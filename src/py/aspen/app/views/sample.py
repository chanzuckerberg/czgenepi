from flask import jsonify, session
from sqlalchemy.orm import joinedload

from aspen.app.app import application, requires_auth
from aspen.database.connection import session_scope
from aspen.database.models.sample import Sample
from aspen.database.models.sequences import SequencingReadsCollection
from aspen.database.models.usergroup import Group, User


@application.route("/api/samples", methods=["GET"])
@requires_auth
def samples():
    with session_scope(application.DATABASE_INTERFACE) as db_session:
        profile = session["profile"]
        sequencing_reads = (
            db_session.query(SequencingReadsCollection)
            .join(Sample, Group, User)
            .options(joinedload(SequencingReadsCollection.sample))
            .filter(User.auth0_user_id == profile["user_id"])
        )

        all_sample_data = [
            {"sequence": seq.to_dict(), "sample": seq.sample.to_dict()}
            for seq in sequencing_reads
        ]

        # filter for only information we need in sample table view
        filtered_sample_data = [
            {
                "private_identifier": s["sample"]["private_identifier"],
                "public_identifier": s["sample"]["public_identifier"],
                "upload_date": s["sequence"]["sequencing_date"],
                "collection_date": s["sample"]["collection_date"],
                "collection_location": s["sample"]["location"],
            }
            for s in all_sample_data
        ]

        return jsonify(filtered_sample_data)
