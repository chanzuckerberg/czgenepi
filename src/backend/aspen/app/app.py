import os
from functools import wraps
from pathlib import Path
from typing import Optional

import sentry_sdk
from auth0.v3.exceptions import TokenValidationError
from authlib.integrations.flask_client import OAuth
from flask import g, redirect, request, session
from flask_cors import CORS
from sentry_sdk.integrations.flask import FlaskIntegration
from sqlalchemy.orm.exc import NoResultFound

from aspen.app.aspen_app import AspenApp
from aspen.app.views.api_utils import get_usergroup_query
from aspen.auth.device_auth import validate_auth_header
from aspen.config.config import Config
from aspen.config.docker_compose import DockerComposeConfig
from aspen.config.production import ProductionConfig
from aspen.database.connection import session_scope
from aspen.error import http_exceptions as ex

static_folder = Path(__file__).parent.parent / "static"

flask_env = os.environ.get("FLASK_ENV")
aspen_config: Optional[Config]
if flask_env == "production":
    aspen_config = ProductionConfig()
else:
    aspen_config = DockerComposeConfig()

deployment = os.getenv("DEPLOYMENT_STAGE")

# We should be able to allow this in all environments and only alert on prod.
# Init as early as possible to catch more
sentry_sdk.init(
    dsn=aspen_config.SENTRY_BACKEND_DSN,
    integrations=[FlaskIntegration()],
    environment=deployment,
    # Set traces_sample_rate to 1.0 to capture 100%
    # of transactions for performance monitoring.
    # We recommend adjusting this value in production.
    traces_sample_rate=1.0,
)

application = AspenApp(
    __name__,
    static_folder=str(static_folder),
    aspen_config=aspen_config,
)


@application.errorhandler(ex.AspenException)
def handle_bad_request(err):
    return err.make_response()


allowed_origins = []
frontend_url = os.getenv("FRONTEND_URL")

if deployment not in ["gestaging", "geprod", "staging", "prod"]:
    allowed_origins.extend(
        [r"http://.*\.genepinet\.localdev:\d+", r"^http://localhost:\d+"]
    )
if frontend_url:
    allowed_origins.append(frontend_url)

CORS(
    application,
    max_age=600,
    supports_credentials=True,
    origins=allowed_origins,
    allow_headers=["Content-Type"],
)

oauth = OAuth(application)
auth0 = oauth.register(
    "auth0",
    client_id=application.aspen_config.AUTH0_CLIENT_ID,
    client_secret=application.aspen_config.AUTH0_CLIENT_SECRET,
    api_base_url=application.aspen_config.AUTH0_BASE_URL,
    access_token_url=application.aspen_config.AUTH0_ACCESS_TOKEN_URL,
    authorize_url=application.aspen_config.AUTH0_AUTHORIZE_URL,
    client_kwargs=application.aspen_config.AUTH0_CLIENT_KWARGS,
)


def setup_userinfo(user_id):
    sentry_sdk.set_user(
        {
            "requested_user_id": user_id,
        }
    )
    try:
        user = get_usergroup_query(g.db_session, user_id).one()
    except NoResultFound:
        sentry_sdk.capture_message(
            f"Requested auth0_user_id {user_id} not found in usergroup query."
        )
        return None
    sentry_sdk.set_user(
        {
            "id": user.id,
            "auth0_uid": user.auth0_user_id,
        }
    )
    return user


# use this to wrap protected views
def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("authorization")
        auth0_user_id = None
        if auth_header:
            try:
                payload = validate_auth_header(
                    auth_header,
                    application.aspen_config.AUTH0_DOMAIN,
                    application.aspen_config.AUTH0_CLIENT_ID,
                )
                auth0_user_id = payload["sub"]
            except TokenValidationError as err:
                application.logger.warn(f"Token validation error: {err}")
        elif "profile" in session:
            auth0_user_id = session["profile"]["user_id"]
        # Redirect to Login page
        if not auth0_user_id:
            return redirect("/login")
        with session_scope(application.DATABASE_INTERFACE) as db_session:
            g.db_session = db_session
            found_auth_user = setup_userinfo(auth0_user_id)
            if not found_auth_user:
                # login attempt from user not in DB
                # TODO: return response to user that they do not have an account with aspen.
                return redirect("/login")
            else:
                g.auth_user = found_auth_user
            return f(*args, **kwargs)

    return decorated
