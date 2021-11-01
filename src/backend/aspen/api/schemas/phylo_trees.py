import datetime
from typing import List, Union

from pydantic import constr, StrictStr, validator

from aspen.api.schemas.base import BaseRequest, BaseResponse
from aspen.database.models import PhyloTree

class PhyloTreeRequestSchema(BaseRequest):
    # mypy + pydantic is a work in progress: https://github.com/samuelcolvin/pydantic/issues/156
    name: constr(min_length=1, max_length=128, strict=True)  # type: ignore

class PhyloTreeResponseSchema(BaseRequest):
    name: str
