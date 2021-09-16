from fastapi import Depends, FastAPI
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from aspen.api.config.config import settings
from aspen.api.deps import set_db
from aspen.api.error.http_exceptions import AspenException, exception_handler
from aspen.api.views.health import router as health_router
from aspen.api.views.users import router as user_router


def get_app() -> FastAPI:
    _app = FastAPI(
        title=settings.SERVICE_NAME,
        debug=settings.DEBUG,
        openapi_url="/v2/openapi.json",
        docs_url="/v2/docs",
        dependencies=[Depends(set_db)],
    )

    # _app.include_router(user_router, prefix="/v2/users")
    _app.include_router(health_router, prefix="/v2/health")

    _app.add_exception_handler(
        AspenException,
        exception_handler,
    )

    return _app


app = get_app()
