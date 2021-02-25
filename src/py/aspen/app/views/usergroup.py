from flask import jsonify, session

from aspen.app.app import application, requires_auth
from aspen.app.views.api_utils import get_usergroup_query
from aspen.database.connection import session_scope


@application.route("/api/usergroup", methods=["GET"])
@requires_auth
def usergroup():
    with session_scope(application.aspen_config.DATABASE_INTERFACE) as db_session:
        # since authentication is required to access view this information is guaranteed to be in session
        profile = session["profile"]
        user = get_usergroup_query(db_session, profile["user_id"]).one()
        user_groups = {"user": user.to_dict(), "group": user.group.to_dict()}
        return jsonify(user_groups)
