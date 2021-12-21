from pydantic import constr, ConstrainedStr

from aspen.api.schemas.base import BaseRequest, BaseResponse


class PhyloTreeRequest(BaseRequest):
    id: int
    name: ConstrainedStr = constr(min_length=1, max_length=128, strip_whitespace=True)  # type: ignore


class PhyloTreeResponse(BaseResponse):
    id: int
