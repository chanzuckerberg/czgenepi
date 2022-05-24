import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

from aspen.api.auth import get_auth_user
from aspen.api.deps import get_db
from aspen.api.error import http_exceptions as ex
from aspen.api.schemas.usergroup import GroupMembersResponse, InvitationsResponse
from aspen.auth.auth0_management import Auth0Client, Auth0Org
from aspen.database.models import Group, User

router = APIRouter()


@router.get("/{group_id}/members", response_model=GroupMembersResponse)
async def get_group_members(
    group_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_auth_user),
) -> GroupMembersResponse:
    if user.group.id != group_id and not user.system_admin:
        raise ex.UnauthorizedException("Not authorized")
    group_members_query = (
        sa.select(User).where(User.group_id == group_id).order_by(User.name.asc())  # type: ignore
    )
    group_members_result = await db.execute(group_members_query)
    group_members = group_members_result.scalars().all()
    return GroupMembersResponse.parse_obj({"members": group_members})


@router.get("/{group_id}/invitations", response_model=InvitationsResponse)
async def get_group_invitations(
    group_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    auth0_client: Auth0Client = Depends(get_auth0_client),
    user: User = Depends(get_auth_user),
) -> InvitationsResponse:
    # TODO: Figure out how a db group relates to an auth0 org
    if user.group.id != group_id and not user.system_admin:
        raise ex.UnauthorizedException("Not authorized")
    requested_group_query = sa.select(Group).where(Group.id == group_id)  # type: ignore
    requested_group_result = await db.execute(requested_group_query)
    requested_group: Group = requested_group_result.scalars().one()  # noqa: F841

    try:
        auth0_org: Auth0Org = auth0_client.get_org_by_id(requested_group.auth0_org_id)
    except Exception:
        raise ex.BadRequestException("Not found")
    invitations = auth0_client.get_org_invitations(auth0_org)
    return InvitationsResponse.parse_obj({"invitations": invitations})
