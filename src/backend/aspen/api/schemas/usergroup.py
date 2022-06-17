import datetime
from typing import List, Optional

from pydantic import constr

from aspen.api.schemas.base import BaseRequest, BaseResponse
from aspen.api.schemas.locations import LocationResponse


class GroupCreationRequest(BaseRequest):
    name: constr(min_length=3, max_length=128, strict=True)  # type: ignore
    prefix: constr(min_length=2, max_length=20, strict=True)  # type: ignore
    address: Optional[constr(min_length=1, max_length=128, strict=True)]  # type: ignore
    division: Optional[constr(min_length=1, max_length=128, strict=True)]  # type: ignore
    location: Optional[constr(min_length=1, max_length=128, strict=True)]  # type: ignore
    default_tree_location_id: int


class GroupResponse(BaseResponse):
    id: int
    name: str


class GroupInfoResponse(GroupResponse):
    address: Optional[str]
    prefix: str
    default_tree_location: LocationResponse


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
    group_admin: bool


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


class InvitationResponse(BaseResponse):
    class Inviter(BaseResponse):
        name: str

    class Invitee(BaseResponse):
        email: str

    id: str
    created_at: str
    expires_at: str
    inviter: Inviter
    invitee: Invitee


class InvitationsResponse(BaseResponse):
    invitations: List[InvitationResponse]
