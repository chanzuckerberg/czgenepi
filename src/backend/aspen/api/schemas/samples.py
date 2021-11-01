from pydantic import constr

from aspen.api.schemas.base import BaseRequest


class SampleRequestSchema(BaseRequest):
    # mypy + pydantic is a work in progress: https://github.com/samuelcolvin/pydantic/issues/156
    name: constr(min_length=1, max_length=128, strict=True)  # type: ignore


class SampleResponseSchema(BaseRequest):
    name: str
