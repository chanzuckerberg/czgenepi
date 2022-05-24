import json

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
from aspen.database.models import User

router = APIRouter()


@router.get("/{group_id}/members", response_model=GroupMembersResponse)
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


@router.get("/{group_id}/invitations", response_model=InvitationsResponse)
async def get_group_invitations(
    group_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
) -> InvitationsResponse:
    # TODO: Figure out how a db group relates to an auth0 org
    auth0_client_id = settings.AUTH0_MANAGEMENT_CLIENT_ID
    auth0_client_secret = settings.AUTH0_MANAGEMENT_CLIENT_SECRET
    auth0_domain = settings.AUTH0_DOMAIN
    auth0_client = Auth0Client(client_id=auth0_client_id, client_secret=auth0_client_secret, domain=auth0_domain)
    orgs = auth0_client.get_orgs()
    czi_org: Auth0Org = next(org for org in orgs if org["display_name"] == "CZI")
    invitations = auth0_client.get_org_invitations(czi_org)
    return InvitationsResponse.parse_obj({"invitations": invitations})