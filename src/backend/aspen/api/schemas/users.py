from typing import List, Optional

from aspen.api.schemas.base import BaseResponse


class GroupResponse(BaseResponse):
    id: int
    name: str


class UserBaseResponse(BaseResponse):
    id: int
    name: str
    group: GroupResponse
    agreed_to_tos: bool = False
    acknowledged_policy_version: Optional[str] = None


# Only expose split id to the user it belongs to.
class UserMeResponse(UserBaseResponse):
    split_id: str


class UserResponse(UserBaseResponse):
    pass


class UsersResponse(BaseResponse):
    items: List[UserResponse]
