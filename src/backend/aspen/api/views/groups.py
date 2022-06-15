import sentry_sdk
import sqlalchemy as sa
from auth0.v3.exceptions import Auth0Error
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from starlette.requests import Request

from aspen.api.auth import get_admin_user, get_auth0_apiclient, get_auth_user
from aspen.api.deps import get_db, get_settings
from aspen.api.error import http_exceptions as ex
from aspen.api.schemas.usergroup import (
    GroupCreationRequest,
    GroupInfoResponse,
    GroupInvitationsRequest,
    GroupInvitationsResponse,
    GroupMembersResponse,
    InvitationsResponse,
)
from aspen.api.settings import Settings
from aspen.auth.auth0_management import Auth0Client, Auth0Org
from aspen.database.models import Group, User

router = APIRouter()


@router.post("/", response_model=GroupInfoResponse)
async def create_group(
    group_creation_request: GroupCreationRequest,
    db: AsyncSession = Depends(get_db),
    auth0_client: Auth0Client = Depends(get_auth0_apiclient),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_admin_user),
) -> GroupInfoResponse:
    organization = auth0_client.add_org(
        group_creation_request.prefix.lower(), group_creation_request.name
    )
    group_values = dict(group_creation_request) | {"auth0_org_id": organization["id"]}
    group = Group(**group_values)
    db.add(group)
    await db.commit()

    created_group_query = (
        sa.select(Group)  # type: ignore
        .options(joinedload(Group.default_tree_location))
        .where(Group.auth0_org_id == group.auth0_org_id)
    )
    created_group_query_result = await db.execute(created_group_query)
    created_group = created_group_query_result.scalars().one()
    return GroupInfoResponse.from_orm(created_group)


@router.get("/{group_id}/", response_model=GroupInfoResponse)
async def get_group_info(
    group_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_auth_user),
) -> GroupInfoResponse:
    if user.group.id != group_id and not user.system_admin:
        raise ex.UnauthorizedException("Not authorized")
    group_query = (
        sa.select(Group)  # type: ignore
        .options(joinedload(Group.default_tree_location))
        .where(Group.id == group_id)
    )
    group_query_result = await db.execute(group_query)
    group = group_query_result.scalars().one()
    return GroupInfoResponse.from_orm(group)


@router.get("/{group_id}/members/", response_model=GroupMembersResponse)
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


@router.get("/{group_id}/invitations/", response_model=InvitationsResponse)
async def get_group_invitations(
    group_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    auth0_client: Auth0Client = Depends(get_auth0_apiclient),
    user: User = Depends(get_auth_user),
) -> InvitationsResponse:
    if user.group.id != group_id and not user.system_admin:
        raise ex.UnauthorizedException("Not authorized")
    requested_group_query = sa.select(Group).where(Group.id == group_id)  # type: ignore
    requested_group_result = await db.execute(requested_group_query)
    requested_group: Group = requested_group_result.scalars().one()

    try:
        auth0_org: Auth0Org = auth0_client.get_org_by_id(requested_group.auth0_org_id)
    except Exception:
        raise ex.BadRequestException("Not found")
    invitations = auth0_client.get_org_invitations(auth0_org)
    return InvitationsResponse.parse_obj({"invitations": invitations})


@router.post("/{group_id}/invitations/", response_model=GroupInvitationsResponse)
async def invite_group_members(
    group_id: int,
    group_invitation_request: GroupInvitationsRequest,
    auth0_client: Auth0Client = Depends(get_auth0_apiclient),
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
) -> GroupInvitationsResponse:
    if user.group.id != group_id and not user.system_admin:
        raise ex.UnauthorizedException("Not authorized")
    group = (
        (await db.execute(sa.select(Group).where(Group.id == group_id))).scalars().one()  # type: ignore
    )
    organization = auth0_client.get_org_by_name(group.name)
    client_id = settings.AUTH0_CLIENT_ID
    responses = []
    for email in group_invitation_request.emails:
        # Temporary: We only support adding users to a single group right now,
        # so skip sending emails to users that already exist elsewhere.
        success = True
        if auth0_client.get_user_by_email(email):
            success = True
        try:
            if success:
                auth0_client.invite_member(
                    organization["id"], client_id, user.name, email, "member"
                )
        except Auth0Error as err:
            # TODO - we need to learn more about possible exceptions here.
            sentry_sdk.capture_exception(err)
            success = False
        responses.append({"email": email, "success": success})

    return GroupInvitationsResponse.parse_obj({"invitations": responses})
