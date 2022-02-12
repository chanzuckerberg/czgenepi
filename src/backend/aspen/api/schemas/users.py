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


class UserResponse(UserBaseResponse):
    pass


class UsersResponse(BaseResponse):
    items: List[UserResponse]
