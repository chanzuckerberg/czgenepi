from aspen.api.schemas.base import BaseResponse


class PathogenLineagesResponse(BaseResponse):
    lineages: list[str]
