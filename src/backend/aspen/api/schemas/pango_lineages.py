from aspen.api.schemas.base import BaseResponse


class PangoLineagesResponse(BaseResponse):
    lineages: list[str]
