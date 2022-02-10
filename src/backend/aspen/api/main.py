import os
from typing import List

import sentry_sdk
from authlib.integrations.starlette_client import OAuth
from fastapi import Depends, FastAPI
from fastapi.responses import ORJSONResponse
from sentry_sdk.integrations.asgi import SentryAsgiMiddleware
from starlette.middleware.cors import CORSMiddleware

from aspen.api.auth import get_auth_user
from aspen.api.error.http_exceptions import AspenException, exception_handler
from aspen.api.middleware.session import SessionMiddleware
from aspen.api.settings import Settings
from aspen.api.views import auspice, auth, health, locations, phylo_runs, samples, users, usher


def get_allowed_origins() -> List[str]:
    allowed_origins = []
    deployment = os.getenv("DEPLOYMENT_STAGE")
    frontend_url = os.getenv("FRONTEND_URL")

    if deployment not in ["gestaging", "geprod", "staging", "prod"]:
        allowed_origins.extend(
            [r"http://.*\.genepinet\.localdev:\d+", r"^http://localhost:\d+"]
        )
    if frontend_url:
        allowed_origins.append(frontend_url)
    return allowed_origins


def get_app() -> FastAPI:
    settings = Settings()
    _app = FastAPI(
        title=settings.SERVICE_NAME,
        debug=settings.DEBUG,
        openapi_url="/v2/openapi.json",
        docs_url="/v2/docs",
        default_response_class=ORJSONResponse,
    )

    # Add a global settings object to the app that we can use as a dependency
    _app.state.aspen_settings = settings

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
    )
    _app.state.auth0_client = auth0

    # Configure CORS
    _app.add_middleware(
        CORSMiddleware,
        allow_origins=get_allowed_origins(),
        allow_headers=["Content-Type"],
        allow_credentials=True,
        max_age=600,
        allow_methods=["*"],
    )
    _app.add_middleware(SessionMiddleware, secret_key=settings.FLASK_SECRET)

    sentry_sdk.init(
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
        usher.router, prefix="/v2/usher", dependencies=[Depends(get_auth_user)]
    )
    _app.include_router(
        phylo_runs.router,
        prefix="/v2/phylo_runs",
        dependencies=[Depends(get_auth_user)],
    )
    _app.include_router(
        samples.router,
        prefix="/v2/samples",
        dependencies=[Depends(get_auth_user)],
    )
    _app.include_router(
        locations.router,
        prefix="/v2/locations",
        dependencies=[Depends(get_auth_user)],
    )
    _app.include_router(auspice.router, prefix="/v2/auspice")

    _app.add_exception_handler(
        AspenException,
        exception_handler,
    )

    return _app


app = get_app()
