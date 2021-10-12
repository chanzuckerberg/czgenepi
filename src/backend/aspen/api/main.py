import os

from fastapi import Depends, FastAPI
from starlette.middleware.cors import CORSMiddleware

from aspen.api.auth import get_auth_user
from aspen.api.deps import set_db
from aspen.api.error.http_exceptions import AspenException, exception_handler
from aspen.api.middleware.session import SessionMiddleware
from aspen.api.settings import get_settings
from aspen.api.views import auth, health, users


def get_allowed_origins():
    allowed_origins = []
    deployment = os.getenv("DEPLOYMENT_STAGE")
    frontend_url = os.getenv("FRONTEND_URL")

    if deployment not in ["staging", "prod"]:
        allowed_origins.extend(
            [r"http://.*\.genepinet\.local:\d+", r"^http://localhost:\d+"]
        )
    if frontend_url:
        allowed_origins.append(frontend_url)
    return allowed_origins


def get_app() -> FastAPI:
    settings = get_settings()
    _app = FastAPI(
        title=settings.SERVICE_NAME,
        debug=settings.DEBUG,
        openapi_url="/v2/openapi.json",
        docs_url="/v2/docs",
        dependencies=[Depends(set_db)],
    )

    # Configure CORS
    _app.add_middleware(
        CORSMiddleware,
        allow_origins=get_allowed_origins(),
        allow_headers=["Content-Type"],
        allow_credentials=True,
        max_age=600,
        allow_methods=["*"],
    )
    _app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

    # Warning - do not enable this route!
    _app.include_router(
        users.router, prefix="/v2/users", dependencies=[Depends(get_auth_user)]
    )
    _app.include_router(health.router, prefix="/v2/health")
    _app.include_router(auth.router, prefix="/v2/auth")

    _app.add_exception_handler(
        AspenException,
        exception_handler,
    )

    return _app


app = get_app()
