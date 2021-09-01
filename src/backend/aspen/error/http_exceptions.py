from typing import Any, Mapping, Optional

from flask import jsonify, make_response, Response


class AspenException(Exception):
    status_code = 500

    def __init__(self, msg, extra: Optional[Mapping[str, Any]] = None):
        super().__init__(msg)
        self.extra = extra

    def make_response(self) -> Response:
        err = str(self)
        respdata = {"error": err}
        if self.extra:
            respdata.update(self.extra)
        response = make_response(jsonify(respdata), self.status_code)
        response.headers["Content-Type"] = "application/json"
        return response


class UnauthorizedException(AspenException):
    status_code = 401


class BadRequestException(AspenException):
    status_code = 400


class NotFoundException(AspenException):
    status_code = 404


class ServerException(AspenException):
    status_code = 500
