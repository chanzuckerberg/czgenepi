from typing import List

from aspen.api.schemas.base import BaseResponse


class UsherTreeVersion(BaseResponse):
    id: int
    description: str
    value: str
    priority: int


class UsherTreeVersionsResponse(BaseResponse):
    usher_options: List[UsherTreeVersion]
