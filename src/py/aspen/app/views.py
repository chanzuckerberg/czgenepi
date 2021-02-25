from pathlib import Path
from urllib.parse import urlencode

from flask import jsonify, redirect, send_from_directory, session, url_for
from sqlalchemy.orm import joinedload

from aspen.app.app import application, auth0, requires_auth
from aspen.database.connection import session_scope
from aspen.database.models.usergroup import User


# Catch all routes. If path is a file, send the file;
# else send index.html. Allows reloading React app from any route.
@application.route("/", defaults={"path": ""})
@application.route("/<path:path>")
@requires_auth
def serve(path):
    if path != "" and Path(application.static_folder + "/" + path).exists():
        return send_from_directory(application.static_folder, path)
    else:
        return send_from_directory(application.static_folder, "index.html")


@application.route("/callback")
def callback_handling():
    # Handles response from token endpoint
    auth0.authorize_access_token()
    resp = auth0.get("userinfo")
    userinfo = resp.json()

    # Store the user information in flask session.
    session["jwt_payload"] = userinfo
    session["profile"] = {
        "user_id": userinfo["sub"],
        "name": userinfo["name"],
    }
    return redirect("/")


@application.route("/login")
def login():
    return auth0.authorize_redirect(
        redirect_uri=application.aspen_config.AUTH0_CALLBACK_URL
    )


@application.route("/logout")
def logout():
    # Clear session stored data
    session.clear()
    # Redirect user to logout endpoint
    params = {
        "returnTo": url_for("serve", _external=True),
        "client_id": application.aspen_config.AUTH0_CLIENT_ID,
    }
    return redirect(auth0.api_base_url + "/v2/logout?" + urlencode(params))


@application.route("/api/usergroup", methods=["GET"])
@requires_auth
def usergroup():
    with session_scope(
        application.aspen_config.DATABASE_CONFIG.INTERFACE
    ) as db_session:
        # since authentication is required to access view this information is guaranteed to be in session
        profile = session["profile"]
        user = (
            db_session.query(User)
            .options(joinedload(User.group))
            .filter(User.auth0_user_id == profile["user_id"])
            .one()
        )
        user_groups = {"user": user.to_dict(), "group": user.group.to_dict()}
        return jsonify(user_groups)
