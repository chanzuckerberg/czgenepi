from functools import partial

from fastapi import Depends, FastAPI
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from aspen.api.config.config import settings
from aspen.api.deps import set_db
from aspen.api.error.http_exceptions import AspenException, exception_handler
from aspen.api.views import auth, health


def get_allowed_origins():
    allowed_origins = []
    frontend_url = os.getenv("FRONTEND_URL")

    if deployment not in ["staging", "prod"]:
        allowed_origins.extend(
            [r"http://.*\.genepinet\.local:\d+", r"^http://localhost:\d+"]
        )
    if frontend_url:
        allowed_origins.append(frontend_url)
    return allowed_origins


def get_app() -> FastAPI:
    _app = FastAPI(
        title=settings.SERVICE_NAME,
        debug=settings.DEBUG,
        openapi_url="/v2/openapi.json",
        docs_url="/v2/docs",
        dependencies=[Depends(partial(set_db, settings))],
    )

    # Configure CORS
    # _app.add_middleware(CORSMiddleware, allow_origins=allow_origins(), allow_headers=['Content-Type'], allow_credentials=True, max_age=600, allow_methods=['*'])
    _app.add_middleware(SessionMiddleware, secret_key="!secret")

    # Warning - do not enable this route!
    # _app.include_router(users.router, prefix="/v2/users")
    _app.include_router(health.router, prefix="/v2/health")
    _app.include_router(auth.router, prefix="/v2/auth")

    _app.add_exception_handler(
        AspenException,
        exception_handler,
    )

    return _app


app = get_app()
