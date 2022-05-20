import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

from aspen.api.auth import get_auth0_client, get_auth_user
from aspen.api.deps import get_db, get_settings
from aspen.api.error import http_exceptions as ex
from aspen.api.schemas.usergroup import (
    GroupInvitationsRequest,
    GroupInvitationsResponse,
    GroupMembersResponse,
)
from aspen.api.settings import Settings
from aspen.auth.auth0_management import Auth0Client
from aspen.database.models import Group, User

router = APIRouter()


@router.get("/{group_id}/members/", response_model=GroupMembersResponse)
async def get_group_members(
    group_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_auth_user),
) -> GroupMembersResponse:
    if user.group.id != group_id:
        raise ex.UnauthorizedException("Not authorized")
    group_members_query = (
        sa.select(User).where(User.group_id == group_id).order_by(User.name.asc())  # type: ignore
    )
    group_members_result = await db.execute(group_members_query)
    group_members = group_members_result.scalars().all()
    return GroupMembersResponse.parse_obj({"members": group_members})


@router.post("/{group_id}/invitations/", response_model=GroupInvitationsResponse)
async def invite_group_members(
    group_id: int,
    group_invitation_request: GroupInvitationsRequest,
    auth0_client: Auth0Client = Depends(get_auth0_client),
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
) -> GroupInvitationsResponse:
    if user.group.id != group_id:
        raise ex.UnauthorizedException("Not authorized")
    group = (
        (await db.execute(sa.select(Group).where(Group.id == group_id))).scalars().one()
    )
    organization = auth0_client.get_org(group.name)
    client_id = settings.AUTH0_CLIENT_ID
    responses = []
    for email in group_invitation_request.emails:
        success = True
        try:
            auth0_client.invite_member(
                organization["id"], client_id, user.name, email, "member"
            )
        except:
            success = False
        responses.append({"email": email, "success": success})

    return GroupInvitationsResponse.parse_obj({"invitations": responses})
