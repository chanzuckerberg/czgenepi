import os
from typing import List, Optional

import sentry_sdk
import uvicorn
from authlib.integrations.starlette_client import OAuth
from fastapi import Depends, FastAPI
from fastapi.responses import ORJSONResponse
from sentry_sdk.integrations.asgi import SentryAsgiMiddleware
from starlette.middleware.cors import CORSMiddleware

from aspen.api.authn import get_auth_user, require_group_membership
from aspen.api.error.http_exceptions import AspenException, exception_handler
from aspen.api.middleware.session import SessionMiddleware
from aspen.api.settings import APISettings
from aspen.api.views import (
    auspice,
    auth,
    groups,
    health,
    lineages,
    locations,
    pathogens,
    phylo_runs,
    phylo_trees,
    qc_mutations,
    samples,
    sequences,
    users,
    usher,
)
from aspen.util.split import SplitClient


def get_allowed_origins() -> List[str]:
    """Allowed origins for cross origin requests. See `CORSMiddleware`.

    Gets list of all allowed origins for cross origin requests. This is pretty
    simple right now: we only serve the FE of our app and Galago with content
    from our BE, so that's all this needs to cover. For ease, the Galago URLs
    are just hardcoded. If we ever need to start handling a lot more CORS
    requests or the Galago URLs become more dynamic, we should reevaluate
    current process.
    """
    allowed_origins = [
        "https://galago.czgenepi.org",
        "https://galago-labs.czgenepi.org",
    ]
    frontend_url = os.getenv("FRONTEND_URL")
    if frontend_url:
        allowed_origins.append(frontend_url)
    return allowed_origins


def get_allowed_origin_regex() -> Optional[str]:
    """Allowed origin regex for cross origin requests. See `CORSMiddleware`.

    This is here to enable working on Galago in localdev. Since we don't
    have a standard port to run Galago on in localdev (everybody wants 3000),
    this is just a catchall for all ports to enable CORS in localdev.
    """
    allowed_origin_regex = None  # default case, do not use regex for CORS
    deployment = os.getenv("DEPLOYMENT_STAGE")
    if deployment == "local":
        allowed_origin_regex = r"^http://localhost:\d+"
    return allowed_origin_regex


def get_app() -> FastAPI:
    settings = APISettings()
    _app = FastAPI(
        title=settings.SERVICE_NAME,
        debug=settings.DEBUG,
        openapi_url="/v2/openapi.json",
        docs_url="/v2/docs",
        default_response_class=ORJSONResponse,
    )

    # Add a global settings object to the app that we can use as a dependency
    _app.state.aspen_settings = settings

    # Set up Split.io feature flagging
    splitio = SplitClient(settings)

    # Add a global splitio object to the app that we can use as a dependency
    _app.state.splitio = splitio

    # Add a global oauth client to the app that we can use as a dependency
    oauth = OAuth()
    auth0 = oauth.register(
        "auth0",
        client_id=settings.AUTH0_CLIENT_ID,
        client_secret=settings.AUTH0_CLIENT_SECRET,
        api_base_url=settings.AUTH0_BASE_URL,
        access_token_url=settings.AUTH0_ACCESS_TOKEN_URL,
        authorize_url=settings.AUTH0_AUTHORIZE_URL,
        client_kwargs=settings.AUTH0_CLIENT_KWARGS,
        server_metadata_url=settings.AUTH0_SERVER_METADATA_URL,
    )
    _app.state.auth0_client = auth0

    # Configure CORS
    _app.add_middleware(
        CORSMiddleware,
        allow_origins=get_allowed_origins(),
        allow_origin_regex=get_allowed_origin_regex(),
        allow_headers=["Content-Type"],
        allow_credentials=True,
        max_age=600,
        allow_methods=["*"],
    )
    _app.add_middleware(SessionMiddleware, secret_key=settings.FLASK_SECRET)

    sentry_sdk.init(  # type: ignore
        dsn=settings.SENTRY_BACKEND_DSN,
        environment=os.environ.get("DEPLOYMENT_STAGE"),
        traces_sample_rate=1.0,
    )
    _app.add_middleware(SentryAsgiMiddleware)

    _app.include_router(
        users.router, prefix="/v2/users", dependencies=[Depends(get_auth_user)]
    )
    _app.include_router(health.router, prefix="/v2/health")
    _app.include_router(auth.router, prefix="/v2/auth")
    _app.include_router(
        lineages.router,
        prefix="/v2/lineages",
        dependencies=[Depends(get_auth_user)],
    )
    _app.include_router(
        locations.router,
        prefix="/v2/locations",
        dependencies=[Depends(get_auth_user)],
    )
    _app.include_router(
        groups.router, prefix="/v2/groups", dependencies=[Depends(get_auth_user)]
    )
    _app.include_router(
        pathogens.router, prefix="/v2/pathogens", dependencies=[Depends(get_auth_user)]
    )
    _app.add_exception_handler(
        AspenException,
        exception_handler,
    )

    # Auspice endpoints don't all require authentication, they can do their own login checks.
    _app.include_router(auspice.router, prefix="/v2/orgs/{org_id}/auspice")
    _app.include_router(
        auspice.router, prefix="/v2/orgs/{org_id}/pathogens/{pathogen_slug}/auspice"
    )

    org_routers = {
        "sequences": sequences.router,
        "phylo_trees": phylo_trees.router,
        "phylo_runs": phylo_runs.router,
        "qc_mutations": qc_mutations.router,
        "samples": samples.router,
        "usher": usher.router,
    }
    for suffix, router in org_routers.items():
        # add pathogen support to endpoints
        _app.include_router(
            router,
            prefix="/v2/orgs/{org_id}/pathogens/{pathogen_slug}/" + suffix,
            dependencies=[Depends(require_group_membership)],
        )

        # if urls don't include pathogen_slugs, default to SC2
        _app.include_router(
            router,
            prefix="/v2/orgs/{org_id}/" + suffix,
            dependencies=[Depends(require_group_membership)],
        )

    return _app


app = get_app()

if __name__ == "__main__":
    config = uvicorn.Config(
        "aspen.api.main:app", host="0.0.0.0", port=3000, log_level="info"
    )
    server = uvicorn.Server(config)
    server.run()
