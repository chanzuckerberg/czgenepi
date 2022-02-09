from aspen.api.schemas.base import BaseRequest, BaseResponse


class GenerateAuspiceMagicLinkRequest(BaseRequest):
    tree_id: int


class GenerateAuspiceMagicLinkResponse(BaseResponse):
    url: str
