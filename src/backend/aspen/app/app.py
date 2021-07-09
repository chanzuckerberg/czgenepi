import os
import sentry_sdk

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

# We should be able to allow this in all environments and only alert on prod.
# Init as early as possible to catch more
sentry_sdk.init(
    aspen_config.SENTRY_URL,

    # Set traces_sample_rate to 1.0 to capture 100%
    # of transactions for performance monitoring.
    # We recommend adjusting this value in production.
    traces_sample_rate=1.0
)

if flask_env == "production":
    sentry_sdk.set_user({
        "id": "0",
        "username": "prod",
    })

naughty = int(application.aspen_config.SENTRY_URL)
divide_by_zero = naughty / 0

application = AspenApp(
    __name__,
    static_folder=str(static_folder),
    aspen_config=aspen_config,
)

deployment = os.getenv("DEPLOYMENT_STAGE")

allowed_origins = []
frontend_url = os.getenv("FRONTEND_URL")

if deployment not in ["staging", "prod"]:
    allowed_origins.extend(
        [r"http://.*\.genepinet\.local:\d+", r"^http://localhost:\d+"]
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

# use this to wrap protected views
def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if "profile" not in session:
            # Redirect to Login page
            return redirect("/login")
        return f(*args, **kwargs)

    return decorated
