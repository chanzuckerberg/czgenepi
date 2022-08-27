from typing import List

from aspen.api.schemas.base import BaseResponse


class PathogenResponse(BaseResponse):
    class Config:
        orm_mode = True

    id: int
    slug: str
    name: str


class PathogensResponse(BaseResponse):
    pathogens: List[PathogenResponse]
