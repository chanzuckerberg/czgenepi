from aspen.api.schemas.base import BaseResponse


class Health(BaseResponse):
    healthy: bool = False
