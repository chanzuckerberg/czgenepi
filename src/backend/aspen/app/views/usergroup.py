from flask import jsonify, session, request

from aspen.app.app import application, requires_auth
from aspen.app.views.api_utils import get_usergroup_query
from aspen.database.connection import session_scope


@application.route("/api/usergroup", methods=["GET", "PUT"])
@requires_auth
def usergroup():
    with session_scope(application.DATABASE_INTERFACE) as db_session:
        # since authentication is required to access view this information is guaranteed
        # to be in session
        profile = session["profile"]
        user = get_usergroup_query(db_session, profile["user_id"]).one()

        if request.method == "GET":
            user_groups = {"user": user.to_dict(), "group": user.group.to_dict()}
            return jsonify(user_groups)

        if request.method == "PUT":


