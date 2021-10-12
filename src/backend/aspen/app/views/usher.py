"""Views for handling anything related to UShER"""
from typing import Iterable

from flask import g, jsonify

from aspen.app.app import application, requires_auth
from aspen.app.serializers import UsherOptionResponseSchema
from aspen.database.models.usher import UsherOption


@application.route("/api/usher/tree_options", methods=["GET"])
@requires_auth
def get_usher_tree_options():
    """Gets all options user can pick from when creating tree via UShER.

    Transparent view of all info on each option in database.
    Returned in order of priority. First in options list is highest priority,
    which is what should be the default selection and first offered option.
    """
    usher_options: Iterable[UsherOption] = (
        g.db_session.query(UsherOption)
        .order_by(
            # Lowest priority is most important, lessens as priority ascends
            UsherOption.priority.asc()
        )
        .all()
    )

    options_schema = UsherOptionResponseSchema(many=True)
    return jsonify({"usher_options": options_schema.dump(usher_options)})
