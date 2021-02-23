import os
from functools import wraps
from pathlib import Path
from urllib.parse import urlencode

from authlib.integrations.flask_client import OAuth
from flask import Flask, redirect, send_from_directory, session, url_for

from aspen.config import DevelopmentConfig, StagingConfig

static_folder = Path("static")

# EB looks for an 'application' callable by default.
application = Flask(__name__, static_folder=str(static_folder))

if os.environ.get("FLASK_ENV") == "development":
    application.config.from_object(DevelopmentConfig())
if os.environ.get("FLASK_ENV") == "staging":
    application.config.from_object(StagingConfig())

auth0_config = application.config["AUTH0_CONFIG"]
oauth = OAuth(application)

auth0 = oauth.register(
    "auth0",
    client_id=auth0_config.AUTH0_CLIENT_ID,
    client_secret=auth0_config.AUTH0_CLIENT_SECRET,
    api_base_url=auth0_config.AUTH0_BASE_URL,
    access_token_url=auth0_config.ACCESS_TOKEN_URL,
    authorize_url=auth0_config.AUTHORIZE_URL,
    client_kwargs=auth0_config.CLIENT_KWARGS,
)


# use this to wrap protected views
def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if "profile" not in session:
            # Redirect to Login page
            return redirect("/login")
        return f(*args, **kwargs)

    return decorated


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
    return auth0.authorize_redirect(redirect_uri=auth0_config.AUTH0_CALLBACK_URL)


@application.route("/logout")
def logout():
    # Clear session stored data
    session.clear()
    # Redirect user to logout endpoint
    params = {
        "returnTo": url_for("serve", _external=True),
        "client_id": auth0_config.AUTH0_CLIENT_ID,
    }
    return redirect(auth0.api_base_url + "/v2/logout?" + urlencode(params))
