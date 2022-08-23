import datetime
from typing import List, Optional

from pydantic import constr

from aspen.api.schemas.base import BaseRequest, BaseResponse
from aspen.api.schemas.locations import LocationResponse


class GroupCreationRequest(BaseRequest):
    name: constr(min_length=3, max_length=128, strict=True)  # type: ignore
    submitting_lab: Optional[constr(min_length=3, max_length=128, strict=True)]  # type: ignore
    # group prefix currently is used in the SFN name, which has max char limit
    # `prefix` cannot be arbitrarily increased until this ticket is resolved:
    # https://app.shortcut.com/genepi/story/209498
    prefix: constr(min_length=2, max_length=25, strict=True)  # type: ignore
    address: Optional[constr(min_length=1, max_length=1000, strict=True)]  # type: ignore
    division: Optional[constr(min_length=1, max_length=1000, strict=True)]  # type: ignore
    location: Optional[constr(min_length=1, max_length=1000, strict=True)]  # type: ignore
    default_tree_location_id: int


class GroupResponse(BaseResponse):
    id: int
    name: str


class GroupInfoResponse(GroupResponse):
    address: Optional[str]
    prefix: str
    default_tree_location: LocationResponse
    submitting_lab: Optional[str]


class UserBaseResponse(BaseResponse):
    id: int
    name: str
    agreed_to_tos: bool = False
    acknowledged_policy_version: Optional[datetime.date] = None
    group_admin: bool


class UserUpdateRequest(BaseRequest):
    agreed_to_tos: Optional[bool] = None
    acknowledged_policy_version: Optional[datetime.date] = None
    name: Optional[str] = None
    gisaid_submitter_id: Optional[str] = None


class GroupRoleResponse(BaseResponse):
    id: int
    name: str
    roles: List[str]


# Only expose split_id, analytics_id, and groups to the user they belong to.
class UserMeResponse(UserBaseResponse):
    split_id: str
    analytics_id: str
    gisaid_submitter_id: Optional[str]
    group: GroupResponse
    groups: List[GroupRoleResponse]


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
    role: str


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
