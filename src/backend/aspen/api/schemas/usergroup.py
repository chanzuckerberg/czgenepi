import datetime
from typing import List, Optional

from aspen.api.schemas.base import BaseRequest, BaseResponse


class GroupResponse(BaseResponse):
    id: int
    name: str


class UserBaseResponse(BaseResponse):
    id: int
    name: str
    agreed_to_tos: bool = False
    acknowledged_policy_version: Optional[datetime.date] = None


class UserUpdateRequest(BaseRequest):
    agreed_to_tos: Optional[bool] = None
    acknowledged_policy_version: Optional[datetime.date] = None


# Only expose split id and groups to the user it belongs to.
class UserMeResponse(UserBaseResponse):
    split_id: str
    group: GroupResponse


class GroupInvitationsRequest(BaseRequest):
    role: str
    emails: List[str]


class GroupInvitationResponse(BaseRequest):
    email: str
    success: bool


class GroupInvitationsResponse(BaseRequest):
    invitations: List[GroupInvitationResponse]


class UserPostRequest(BaseRequest):
    name: str
    email: str
    group_id: int
    group_admin: Optional[bool] = False
    system_admin: Optional[bool] = False
    auth0_user_id: str


class MemberResponse(UserBaseResponse):
    email: str
    group_admin: bool


class GroupMembersResponse(BaseResponse):
    members: List[MemberResponse]
