from pydantic import constr

from aspen.api.schemas.base import BaseRequest, BaseResponse


class PhyloTreeRequest(BaseRequest):
    id: int
    name: constr(min_length=1, max_length=128, strip_whitespace=True)


class PhyloTreeResponse(BaseResponse):
    id: int