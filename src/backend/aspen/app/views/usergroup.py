from typing import Collection, Dict, Union

from flask import jsonify, request, Response, session

from aspen.app.app import application, requires_auth
from aspen.app.views.api_utils import filter_usergroup_dict, get_usergroup_query
from aspen.database.connection import session_scope
from aspen.database.models.usergroup import User

GET_USER_FIELDS: Collection[str] = ("name", "agreed_to_tos")
GET_GROUP_FIELDS: Collection[str] = ("name",)
PUT_USER_FIELDS: Collection[str] = ("name", "email", "agreed_to_tos")


@application.route("/api/usergroup", methods=["GET", "PUT"])
@requires_auth
def usergroup():
    with session_scope(application.DATABASE_INTERFACE) as db_session:
        # since authentication is required to access view this information is guaranteed
        # to be in session
        profile: Dict[str, str] = session["profile"]
        user: User = get_usergroup_query(db_session, profile["user_id"]).one()

        if request.method == "GET":
            user_groups: Dict[str, Dict[str, Union[str, bool]]] = {
                "user": filter_usergroup_dict(user.to_dict(), GET_USER_FIELDS),
                "group": filter_usergroup_dict(user.group.to_dict(), GET_GROUP_FIELDS),
            }
            return jsonify(user_groups)

        if request.method == "PUT":
            fields_to_update: Dict[str, Union[str, bool]] = request.get_json()

            for key, value in fields_to_update.items():
                if hasattr(user, key) and key in PUT_USER_FIELDS:
                    setattr(user, key, value)
                else:
                    return Response(
                        f"only the following fields can be updated on the User object: {update_allowed_fields}, you provided the attribute <{key}>",
                        400,
                    )

            # all fields have updated successfully
            db_session.flush()
            return jsonify(success=True)
