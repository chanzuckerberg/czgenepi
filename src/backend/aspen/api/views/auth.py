import os
from typing import Optional
from urllib.parse import urlencode

import sqlalchemy as sa
from authlib.integrations.base_client.errors import OAuthError
from authlib.integrations.starlette_client import StarletteOAuth2App
from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.exc import NoResultFound
from starlette.requests import Request
from starlette.responses import Response

import aspen.api.error.http_exceptions as ex
from aspen.api.authn import get_auth0_apiclient
from aspen.api.deps import get_auth0_client, get_db, get_settings
from aspen.api.settings import Settings
from aspen.auth.auth0_management import Auth0Client
from aspen.auth.role_manager import RoleManager
from aspen.database.models import Group, User

# From the example here:
# https://github.com/authlib/demo-oauth-client/tree/master/fastapi-google-login
router = APIRouter()


@router.get("/login")
async def login(
    request: Request,
    organization: Optional[str] = None,
    invitation: Optional[str] = None,
    organization_name: Optional[str] = None,
    auth0: StarletteOAuth2App = Depends(get_auth0_client),
    settings: Settings = Depends(get_settings),
) -> Response:
    kwargs = {}
    if invitation:
        kwargs["invitation"] = invitation
    if organization:
        kwargs["organization"] = organization
    if organization_name:
        kwargs["organization_name"] = organization_name
    return await auth0.authorize_redirect(
        request, settings.AUTH0_CALLBACK_URL, **kwargs
    )


async def create_user_if_not_exists(db, auth0_mgmt, userinfo) -> User:
    auth0_user_id = userinfo.get("sub")
    if not auth0_user_id:
        # User ID really needs to be present
        raise ex.UnauthorizedException("Invalid user id")
    userquery = await db.execute(
        sa.select(User).filter(User.auth0_user_id == auth0_user_id)  # type: ignore
    )
    try:
        # Return early if this user already exists
        user = userquery.scalars().one()
        return user
    except NoResultFound:
        pass
    # We're currently only creating new users if they're confirming an org invitation
    if "org_id" not in userinfo:
        raise ex.UnauthorizedException("Invalid group id")
    groupquery = await db.execute(
        sa.select(Group).filter(Group.auth0_org_id == userinfo["org_id"])  # type: ignore
    )
    # If the group doesn't exist, we can't create a user for it
    try:
        group = groupquery.scalars().one()  # type: ignore
    except NoResultFound:
        raise ex.UnauthorizedException("Unknown group")

    # Get the user's roles for this organization and tag them as group admins if necessary.
    # TODO - user.group_admin and user.group_id are going away very soon, so we should
    #        clean this up when we're ready.
    roles = auth0_mgmt.get_org_user_roles(userinfo["org_id"], auth0_user_id)

    user_fields = {
        "name": userinfo["email"],
        "email": userinfo["email"],
        "auth0_user_id": auth0_user_id,
        "group_admin": "admin" in roles,
        "system_admin": False,
        "group": group,
    }
    newuser = User(**user_fields)
    db.add(newuser)
    return newuser


@router.get("/callback")
async def auth(
    request: Request,
    auth0: StarletteOAuth2App = Depends(get_auth0_client),
    db: AsyncSession = Depends(get_db),
    auth0_mgmt: Auth0Client = Depends(get_auth0_apiclient),
) -> Response:
    try:
        token = await auth0.authorize_access_token(request)
    except OAuthError:
        raise ex.UnauthorizedException("Invalid token")
    userinfo = token.get("userinfo")
    if userinfo:
        # Store the user information in flask session.
        request.session["jwt_payload"] = userinfo
        request.session["profile"] = {
            "user_id": userinfo["sub"],
            "name": userinfo["name"],
        }
        user = await create_user_if_not_exists(db, auth0_mgmt, userinfo)
        # Always re-sync auth0 groups to our db on login!
        await RoleManager.sync_user_roles(db, auth0_mgmt, user)
        await db.commit()
    else:
        raise ex.UnauthorizedException("No user info in token")
    return RedirectResponse(os.getenv("FRONTEND_URL", "") + "/data/samples")


@router.get("/logout")
async def logout(
    request: Request, settings: Settings = Depends(get_settings)
) -> Response:
    # Clear session stored data
    request.session.pop("jwt_payload", None)
    request.session.pop("profile", None)
    # Redirect user to logout endpoint
    params = {
        "returnTo": os.getenv("FRONTEND_URL"),
        "client_id": settings.AUTH0_CLIENT_ID,
    }
    return RedirectResponse(f"{settings.AUTH0_LOGOUT_URL}?{urlencode(params)}")
