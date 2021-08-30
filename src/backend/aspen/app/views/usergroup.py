from typing import Collection, Dict, Mapping, Union

from auth0.v3 import authentication as auth0_authentication
from auth0.v3.exceptions import Auth0Error
from auth0.v3.management import Auth0
from flask import g, jsonify, request, Response

from aspen.app import exceptions as ex
from aspen.app.app import application, requires_auth
from aspen.app.views.api_utils import filter_usergroup_dict
from aspen.config.config import Config
from aspen.database.models.usergroup import User

GET_USER_FIELDS: Collection[str] = ("name", "agreed_to_tos")
GET_GROUP_FIELDS: Collection[str] = ("name",)
PUT_USER_FIELDS: Collection[str] = ("name", "email", "agreed_to_tos")
POST_USER_REQUIRED_FIELDS: Collection[str] = (
    "name",
    "email",
    "group_admin",
    "system_admin",
    "group_id",
)
POST_USER_OPTIONAL_FIELDS: Collection[str] = ("auth0_user_id",)


def create_auth0_entry(
    name: str,
    email: str,
    password: str,
    config: Config,
) -> Union[Mapping[str, Union[str, bool, Collection]], Response]:
    domain: str = config.AUTH0_DOMAIN
    client_id: str = config.AUTH0_MANAGEMENT_CLIENT_ID
    client_secret: str = config.AUTH0_MANAGEMENT_CLIENT_SECRET

    get_token = auth0_authentication.GetToken(domain)
    token = get_token.client_credentials(
        client_id, client_secret, "https://{}/api/v2/".format(domain)
    )
    mgmt_api_token: auth0_authentication.get_token.GetToken = token["access_token"]

    auth0: Auth0 = Auth0(domain, mgmt_api_token)
    try:
        user_created: Mapping[str, Union[str, bool, Collection]] = auth0.users.create(
            {
                "connection": "Username-Password-Authentication",
                "email": email,
                "name": name,
                "password": password,
            }
        )
    except Auth0Error as e:
        return Response(e.message, e.status_code)

    return user_created


@application.route("/api/usergroup", methods=["GET", "PUT", "POST"])
@requires_auth
def usergroup():
    user: User = g.auth_user
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
                err = f"only the following fields can be updated on the User object: {PUT_USER_FIELDS}, you provided the attribute <{key}>"
                raise ex.BadRequestException(err)

        # all fields have updated successfully
        g.db_session.flush()
        return jsonify(success=True)

    if request.method == "POST":
        if not user.system_admin:
            err = "Insufficient permissions to create new user, only system admins are able to create new users"
            raise ex.BadRequestException(err)
        # check we're only getting fields that we expect
        new_user_data: Dict[str, Union[str, bool]] = {
            k: v
            for k, v in request.get_json().items()
            if k in POST_USER_REQUIRED_FIELDS + POST_USER_OPTIONAL_FIELDS
        }
        missing_required_fields = [
            f for f in POST_USER_REQUIRED_FIELDS if f not in new_user_data.keys()
        ]
        if missing_required_fields:
            err = f"Insufficient information required to create new user, {missing_required_fields} are required"
            raise ex.BadRequestException(err)
        if "auth0_user_id" not in new_user_data.keys():
            user_created_or_response: Union[
                Mapping[str, Union[str, bool, Collection]], Response
            ] = create_auth0_entry(
                new_user_data["name"],
                new_user_data["email"],
                "pwd",
                application.aspen_config,
            )
            # check if any issues trying to create new user
            if isinstance(user_created_or_response, Response):
                return user_created_or_response
            new_user_data.update({"auth0_user_id": user_created_or_response["user_id"]})

        user = User(**new_user_data)
        g.db_session.add(user)
        g.db_session.flush()
        return jsonify(success=True)
