import datetime
from typing import List, Optional

from aspen.api.schemas.base import BaseResponse, BaseRequest


class GroupResponse(BaseResponse):
    id: int
    name: str


class UserBaseResponse(BaseResponse):
    id: int
    name: str
    group: GroupResponse
    agreed_to_tos: bool = False
    acknowledged_policy_version: Optional[datetime.date] = None


class UserUpdateRequest(BaseRequest):
    agreed_to_tos: bool
    acknowledged_policy_version: datetime.date


# Only expose split id to the user it belongs to.
class UserMeResponse(UserBaseResponse):
    split_id: str


class UserResponse(UserBaseResponse):
    pass


class UsersResponse(BaseResponse):
    items: List[UserResponse]
