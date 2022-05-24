import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

from aspen.api.auth import get_auth_user
from aspen.api.deps import get_db, get_settings
from aspen.api.error import http_exceptions as ex
from aspen.api.schemas.usergroup import GroupMembersResponse, InvitationsResponse
from aspen.api.settings import Settings
from aspen.cli.sync_auth0 import Auth0Client, Auth0Org
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
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
) -> InvitationsResponse:
    # TODO: Figure out how a db group relates to an auth0 org
    if user.group.id != group_id and not user.system_admin:
        raise ex.UnauthorizedException("Not authorized")
    requested_group_query = sa.select(Group).where(Group.id == group_id)  # type: ignore
    requested_group_result = await db.execute(requested_group_query)
    requested_group: Group = requested_group_result.scalars().one()

    auth0_client_id = settings.AUTH0_MANAGEMENT_CLIENT_ID
    auth0_client_secret = settings.AUTH0_MANAGEMENT_CLIENT_SECRET
    auth0_domain = settings.AUTH0_DOMAIN
    auth0_client = Auth0Client(
        client_id=auth0_client_id,
        client_secret=auth0_client_secret,
        domain=auth0_domain,
    )
    orgs = auth0_client.get_orgs()
    # Presumably the org-db connection would look something like this
    # auth0_org: Auth0Org = next(org for org in orgs if org["id"] == requested_group.auth0_org_id)
    auth0_org: Auth0Org = next(
        org for org in orgs if org["display_name"] == user.group.name
    )
    invitations = auth0_client.get_org_invitations(auth0_org)
    return InvitationsResponse.parse_obj({"invitations": invitations})
