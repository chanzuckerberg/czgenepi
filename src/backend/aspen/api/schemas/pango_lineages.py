from aspen.api.schemas.base import BaseResponse


class PangoLineagesResponse(BaseResponse):
    all_pango_lineages: list[str]
