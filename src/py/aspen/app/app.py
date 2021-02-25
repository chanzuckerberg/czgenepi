import os
from functools import wraps
from pathlib import Path

from authlib.integrations.flask_client import OAuth
from flask import Flask, redirect, session

from aspen.config import DevelopmentConfig, ProductionConfig, StagingConfig

static_folder = Path(__file__).parent.parent / "static"

# EB looks for an 'application' callable by default.
application = Flask(__name__, static_folder=str(static_folder))

flask_env = os.environ.get("FLASK_ENV")
if flask_env == "production":
    application.config.from_object(ProductionConfig())
elif flask_env == "development":
    application.config.from_object(DevelopmentConfig())
elif flask_env == "staging":
    application.config.from_object(StagingConfig())

if flask_env in ("production", "development", "staging"):
    oauth = OAuth(application)
    auth0 = oauth.register(
        "auth0",
        client_id=application.config["AUTH0_CLIENT_ID"],
        client_secret=application.config["AUTH0_CLIENT_SECRET"],
        api_base_url=application.config["AUTH0_BASE_URL"],
        access_token_url=application.config["AUTH0_ACCESS_TOKEN_URL"],
        authorize_url=application.config["AUTH0_AUTHORIZE_URL"],
        client_kwargs=application.config["AUTH0_CLIENT_KWARGS"],
    )
else:
    auth0 = None


# use this to wrap protected views
def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if "profile" not in session:
            # Redirect to Login page
            return redirect("/login")
        return f(*args, **kwargs)

    return decorated
