"""Views for handling anything related to UShER"""
from typing import Any, Iterable, Mapping, Sequence

from flask import g, jsonify

from aspen.app.app import application, requires_auth
from aspen.database.models.usher import UsherOption


@application.route("/api/usher/tree_options", methods=["GET"])
@requires_auth
def get_usher_tree_options():
    """DOCME"""
    usher_options: Iterable[UsherOption] = (
        g.db_session.query(UsherOption)
        .order_by(
            # Lowest priority is most important, lessens as priority ascends
            UsherOption.priority.asc()
        )
        .all()
    )

    serializable_options: Sequence[Mapping[str, Any]]
    serializable_options = [option.to_dict() for option in usher_options]
    return jsonify({"usher_options": serializable_options})
