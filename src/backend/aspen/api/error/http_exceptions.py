from typing import Any, Mapping, Optional

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic.error_wrappers import ErrorWrapper
from starlette.requests import Request


class AspenException(Exception):
    status_code = 500

    def __init__(self, msg, extra: Optional[Mapping[str, Any]] = None):
        super().__init__(msg)
        self.extra = extra

    def make_response(self) -> JSONResponse:
        err = str(self)
        respdata = {"error": err}
        if self.extra:
            respdata.update(self.extra)
        return JSONResponse(
            status_code=self.status_code,
            content=respdata,
            headers={"Content-Type": "application/json"},
        )


async def exception_handler(request: Request, exc: AspenException) -> JSONResponse:
    return err.make_response()


class UnauthorizedException(AspenException):
    status_code = 401


class BadRequestException(AspenException):
    status_code = 400


class NotFoundException(AspenException):
    status_code = 404


class ServerException(AspenException):
    status_code = 500
