import os
from functools import wraps
from pathlib import Path
from typing import Optional

from authlib.integrations.flask_client import OAuth
from flask import redirect, session
from flask_cors import CORS

from aspen.app.aspen_app import AspenApp
from aspen.config.config import Config
from aspen.config.docker_compose import DockerComposeConfig
from aspen.config.production import ProductionConfig

static_folder = Path(__file__).parent.parent / "static"

flask_env = os.environ.get("FLASK_ENV")
aspen_config: Optional[Config]
if flask_env == "production":
    aspen_config = ProductionConfig()
else:
    aspen_config = DockerComposeConfig()
application = AspenApp(
    __name__,
    static_folder=str(static_folder),
    aspen_config=aspen_config,
)
# FIXME(mbarrien): Make this more restrictive
allowed_origin = ["*"]
CORS(
    application,
    max_age=600,
    supports_credentials=True,
    origins=allowed_origin,
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


# use this to wrap protected views
def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if "profile" not in session:
            # Redirect to Login page
            return redirect("/login")
        return f(*args, **kwargs)

    return decorated
