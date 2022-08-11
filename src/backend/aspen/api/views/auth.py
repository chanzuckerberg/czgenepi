import os
from datetime import datetime
from typing import Optional, Tuple
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
from aspen.api.authn import get_auth0_apiclient, get_auth_user, get_cookie_userid
from aspen.api.deps import get_auth0_client, get_db, get_settings, get_splitio
from aspen.api.settings import Settings
from aspen.auth.auth0_management import Auth0Client, Auth0Org, Auth0OrgInvitation
from aspen.auth.role_manager import RoleManager
from aspen.database.models import Group, User
from aspen.util.split import SplitClient

# From the example here:
# https://github.com/authlib/demo-oauth-client/tree/master/fastapi-google-login
router = APIRouter()


def get_invitation_ticket(
    a0: Auth0Client, organization: str, invitation: str
) -> Optional[Auth0OrgInvitation]:
    org: Auth0Org = {
        "id": organization,
        "name": organization,
        "display_name": organization,
    }
    # We can't query the auth0 org invitations api directly if we only have a ticket id,
    # so this is the next best thing.
    tickets = a0.get_org_invitations(org)
    for ticket in tickets:
        expires = ticket["expires_at"]
        # Don't process expired invitations
        if datetime.fromisoformat(expires.rstrip("Z")) < datetime.now():
            continue
        if ticket.get("ticket_id") == invitation:
            return ticket
    return None


async def get_invitation_redirect(
    oauth: StarletteOAuth2App,
    settings: Settings,
    a0: Auth0Client,
    db: AsyncSession,
    request: Request,
    invitation: str,
    organization: str,
    organization_name: Optional[str] = None,
    cookie_userid: Optional[str] = None,
) -> Optional[Response]:
    # If this invitation is for an email address that already exists in our db,
    # we'll use our custom invitation acceptance flow to associate their existing
    # account with the invitation. If we haven't seen that email address before,
    # we'll send them to the standard auth0 "create a new account" flow.

    # Load more information about the invitation from auth0
    ticket_info = get_invitation_ticket(a0, organization, invitation)
    if not ticket_info:
        return None
    # Check to see if the user is already in our db.
    invitee = ticket_info["invitee"]["email"]
    try:
        (await db.execute(sa.select(User).where(User.email == invitee))).scalars().one()  # type: ignore
    except NoResultFound:
        # If the user isn't in our db, proceed with regular auth0 flow.
        return None
    # If we're already logged in as this user, just process the invitation and redirect to welcome.
    user = None
    try:
        user = (
            (
                await db.execute(
                    sa.select(User).where(User.auth0_user_id == cookie_userid)  # type: ignore
                )
            )
            .scalars()
            .one()
        )
    except NoResultFound:
        pass
    # If we're already logged in as the invited user, process the invitation!
    if user and invitee == user.email:
        # Redirect to process_invitation endpoint
        redirect_url = (
            settings.API_URL
            + f"/v2/auth/process_invitation?invitation={invitation}&organization={organization}&organization_name={organization_name}"
        )
        return RedirectResponse(redirect_url)
    # If we're not logged in, or logged in as a *different* user, we'll need to stash
    # the invitation in the session and redirect to the login page.
    request.session["process_invitation"] = {
        "invitation": invitation,
        "organization": organization,
        "organization_name": organization_name,
    }
    return await oauth.authorize_redirect(
        request, settings.AUTH0_CALLBACK_URL, login_hint=invitee, prompt="login"
    )


@router.get("/login")
async def login(
    request: Request,
    organization: Optional[str] = None,
    invitation: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    organization_name: Optional[str] = None,
    oauth: StarletteOAuth2App = Depends(get_auth0_client),
    a0: Auth0Client = Depends(get_auth0_apiclient),
    settings: Settings = Depends(get_settings),
    cookie_userid: Optional[str] = Depends(get_cookie_userid),
) -> Response:
    kwargs = {}
    if invitation and organization:
        resp = await get_invitation_redirect(
            oauth,
            settings,
            a0,
            db,
            request,
            invitation,
            organization,
            organization_name,
            cookie_userid,
        )
        if resp:
            return resp
        kwargs["invitation"] = invitation
    if organization:
        kwargs["organization"] = organization
    if organization_name:
        kwargs["organization_name"] = organization_name
    return await oauth.authorize_redirect(
        request, settings.AUTH0_CALLBACK_URL, **kwargs
    )


async def create_user_if_not_exists(
    db, auth0_mgmt, userinfo
) -> Tuple[User, Optional[Group]]:
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
        return user, None
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
    await db.commit()
    return newuser, group


@router.get("/callback")
async def auth(
    request: Request,
    oauth: StarletteOAuth2App = Depends(get_auth0_client),
    splitio: SplitClient = Depends(get_splitio),
    db: AsyncSession = Depends(get_db),
    a0: Auth0Client = Depends(get_auth0_apiclient),
    error_description: Optional[str] = None,
    settings: Settings = Depends(get_settings),
) -> Response:
    if error_description:
        # Note: Auth0 sends the message "invitation not found or already used" for *both* expired and
        # already-used tokens, so users will typically only see the already_accepted error. The "expired"
        # page becomes fallback in case there are any unknown errors auth0 sends.
        if "already used" in error_description:
            return RedirectResponse(
                os.getenv("FRONTEND_URL", "") + "/auth/invite/already_accepted"
            )
        else:
            return RedirectResponse(
                os.getenv("FRONTEND_URL", "") + "/auth/invite/expired"
            )
    try:
        token = await oauth.authorize_access_token(request)
    except OAuthError:
        raise ex.UnauthorizedException("Invalid token")
    userinfo = token.get("userinfo")
    if not userinfo:
        raise ex.UnauthorizedException("No user info in token")
    # Store the user information in flask session.
    request.session["jwt_payload"] = userinfo
    request.session["profile"] = {
        "user_id": userinfo["sub"],
        "name": userinfo["name"],
    }
    user, newuser_group = await create_user_if_not_exists(db, a0, userinfo)
    # Always re-sync auth0 groups to our db on login!
    # Make sure the user is in auth0 before sync'ing roles.
    #  ex: User1 in local dev doesn't exist in auth0
    sync_roles = splitio.get_flag("sync_auth0_roles", user)
    if sync_roles == "on":
        if user.auth0_user_id.startswith("auth0|"):
            await RoleManager.sync_user_roles(db, a0, user)
        await db.commit()

    # If we saved an org invitation in the users's session, redirect the user to the endpoint
    # that can process the invitation, and clear out the invitation info in their session.
    if request.session.get("process_invitation"):
        saved_invitation = request.session.get("process_invitation", {})
        invitation = saved_invitation.get("invitation")
        organization = saved_invitation.get("organization")
        organization_name = saved_invitation.get("organization_name")
        redirect_url = (
            settings.API_URL
            + f"/v2/auth/process_invitation?invitation={invitation}&organization={organization}&organization_name={organization_name}"
        )
        del request.session["process_invitation"]
        return RedirectResponse(redirect_url)
    if userinfo.get("org_id") and newuser_group:
        return RedirectResponse(
            os.getenv("FRONTEND_URL", "") + f"/welcome/{newuser_group.id}"
        )
    else:
        return RedirectResponse(os.getenv("FRONTEND_URL", "") + "/data/samples")


@router.get("/process_invitation")
async def process_invitation(
    request: Request,
    organization: str,
    invitation: str,
    db: AsyncSession = Depends(get_db),
    splitio: SplitClient = Depends(get_splitio),
    organization_name: Optional[str] = None,
    oauth: StarletteOAuth2App = Depends(get_auth0_client),
    a0: Auth0Client = Depends(get_auth0_apiclient),
    settings: Settings = Depends(get_settings),
    user=Depends(get_auth_user),
) -> Response:
    # Load more information about the invitation from auth0
    ticket_info = get_invitation_ticket(a0, organization, invitation)
    if not ticket_info:
        # Let Auth0 complain about the invalid invitation.
        kwargs = {
            "invitation": invitation,
            "organization": organization,
            "organization_name": organization_name,
        }
        return await oauth.authorize_redirect(
            request, settings.AUTH0_CALLBACK_URL, **kwargs
        )

    # Check to see if the user is the same as the one we're logged in as
    invitee = ticket_info["invitee"]["email"]
    if invitee != user.email:
        raise ex.BadRequestException("email address mismatch")

    # If we made it to this point, just process the invitation and redirect to welcome.

    # Tell auth0 to make this user a member of the group and assign roles.
    org: Auth0Org = {
        "id": ticket_info["organization_id"],
        "name": "",
        "display_name": "",
    }
    a0.add_org_member(org, user.auth0_user_id, ticket_info["roles"], False)
    # and our invitation is moot, delete it.
    a0.delete_organization_invitation(ticket_info["organization_id"], ticket_info["id"])

    # ok, now sync a0 roles to the db.
    sync_roles = splitio.get_flag("sync_auth0_roles", user)
    if sync_roles == "on":
        await RoleManager.sync_user_roles(db, a0, user)
        await db.commit()

    try:
        # redirect to the welcome page.
        group = (
            (
                await db.execute(
                    sa.select(Group).where(  # type: ignore
                        Group.auth0_org_id == ticket_info["organization_id"]  # type: ignore
                    )
                )
            )
            .scalars()
            .one()
        )
        return RedirectResponse(os.getenv("FRONTEND_URL", "") + f"/welcome/{group.id}")
    except NoResultFound:
        # This really shouldn't have happened, but send them to the frontend.
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
