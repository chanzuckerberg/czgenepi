import hashlib
import hmac
import json
import logging
from base64 import urlsafe_b64decode
from datetime import datetime, timezone
from typing import List, MutableSequence, Optional, TypedDict

import sentry_sdk
import sqlalchemy as sa
from auth0.v3.exceptions import TokenValidationError
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.orm.query import Query
from starlette.requests import Request

import aspen.api.error.http_exceptions as ex
from aspen.api.deps import get_db, get_settings
from aspen.api.settings import APISettings
from aspen.auth.auth0_management import Auth0Client
from aspen.auth.device_auth import validate_auth_header
from aspen.database.models import Group, GroupRole, User, UserRole


def get_usergroup_query(
    auth0_user_id: Optional[str] = None,
    user_id: Optional[str] = None,
) -> Query:
    query = sa.select(User).options(  # type: ignore
        joinedload(User.user_roles).options(  # type: ignore
            joinedload(UserRole.group, innerjoin=True),  # type: ignore
            joinedload(UserRole.role, innerjoin=True),
        )
    )  # type: ignore
    if auth0_user_id:
        query = query.filter(User.auth0_user_id == auth0_user_id)  # type: ignore
    else:
        query = query.filter(User.id == int(user_id))  # type: ignore
    return query


async def setup_userinfo(
    session: AsyncSession,
    auth0_user_id: Optional[str] = None,
    user_id: Optional[str] = None,
) -> Optional[User]:
    if auth0_user_id:
        sentry_sdk.set_user(
            {
                "requested_user_id": auth0_user_id,
            }
        )
    try:
        userquery = get_usergroup_query(auth0_user_id, user_id)
        userwait = await session.execute(userquery)
        user = userwait.unique().scalars().one()
    except NoResultFound:
        sentry_sdk.capture_message(
            f"Requested auth0_user_id {auth0_user_id} not found in usergroup query."
        )
        return None
    sentry_sdk.set_user(
        {
            "id": user.id,
            "auth0_uid": user.auth0_user_id,
        }
    )
    return user


class MagicLinkPayload(TypedDict):
    user_id: str
    expiry: str


async def magic_link_payload(
    settings: APISettings = Depends(get_settings), magic_link: Optional[str] = None
) -> Optional[MagicLinkPayload]:
    if not magic_link:
        return None

    # First, verify the MAC tag.
    payload_message, payload_mac_tag = magic_link.split(".")
    encoded_payload_message = payload_message.encode("utf8")

    mac_key = urlsafe_b64decode(settings.AUSPICE_MAC_KEY)
    digest_maker = hmac.new(mac_key, encoded_payload_message, hashlib.sha3_512)
    correct_mac_tag = digest_maker.hexdigest()

    authenticated = hmac.compare_digest(payload_mac_tag, correct_mac_tag)
    if not authenticated:
        raise ex.BadRequestException(
            "Unauthenticated attempt to access an auspice magic link"
        )

    # Then decode the payload.
    decoded_payload_message = urlsafe_b64decode(encoded_payload_message).decode("utf8")
    recovered_payload = json.loads(decoded_payload_message)

    # Test the expiry
    expiry_time = datetime.fromisoformat(recovered_payload["expiry"])
    if expiry_time <= datetime.now(timezone.utc):
        raise ex.BadRequestException("Expired auspice view magic link")
    payload: MagicLinkPayload = json.loads(decoded_payload_message)
    return payload


async def magic_link_userid(
    magic_payload: Optional[MagicLinkPayload] = Depends(magic_link_payload),
) -> Optional[str]:
    if not magic_payload:
        return None
    return magic_payload["user_id"]


def get_token_userid(
    request: Request, settings: APISettings = Depends(get_settings)
) -> Optional[str]:
    auth_header = request.headers.get("authorization")
    if not auth_header:
        return None
    try:
        payload = validate_auth_header(
            auth_header, settings.AUTH0_DOMAIN, settings.AUTH0_CLIENT_ID
        )
        return payload["sub"]
    except TokenValidationError as err:
        logging.warn(f"Token validation error: {err}")
    return None


def get_cookie_userid(request: Request) -> Optional[str]:
    if "profile" in request.session:
        return request.session["profile"].get("user_id")
    return None


async def get_auth_user(
    request: Request,
    session: AsyncSession = Depends(get_db),
    magic_link_userid: Optional[str] = Depends(magic_link_userid),
    cookie_userid: Optional[str] = Depends(get_cookie_userid),
    token_userid: Optional[str] = Depends(get_token_userid),
) -> User:
    auth0_user_id = None
    user_id = None
    if magic_link_userid:
        user_id = magic_link_userid
    else:
        auth0_user_id = cookie_userid or token_userid
    # Redirect to Login page
    if not auth0_user_id and not user_id:
        # TODO - redirect to login.
        raise ex.UnauthenticatedException("Login failure")
    found_auth_user = await setup_userinfo(session, auth0_user_id, user_id)
    if not found_auth_user:
        # login attempt from user not in DB
        # TODO - redirect to login.
        raise ex.UnauthenticatedException("Login failure")
    # There's a starlette-context module that allows us to manage
    # per-request data without depending on having a request object
    # available. For now we seem to have `request` when we need it,
    # but we can change this if necessary.
    request.state.auth_user = found_auth_user
    return found_auth_user


async def get_admin_user(auth_user: User = Depends(get_auth_user)) -> None:
    if not auth_user.system_admin:
        raise ex.UnauthorizedException("Not authorized")


async def get_auth0_apiclient(settings: APISettings = Depends(get_settings)):
    client_id: str = settings.AUTH0_MANAGEMENT_CLIENT_ID
    client_secret: str = settings.AUTH0_MANAGEMENT_CLIENT_SECRET
    domain: str = settings.AUTH0_MANAGEMENT_DOMAIN
    auth0_client = Auth0Client(client_id, client_secret, domain)
    return auth0_client


class ACGroupRole(TypedDict):
    group_id: int
    role: str


class AuthContext:
    def __init__(
        self,
        user: User,
        group: Optional[Group],
        user_roles: List[str],
        group_roles: List[ACGroupRole],
    ):
        self.user = user
        self.group = group
        self.user_roles = user_roles
        self.group_roles = group_roles


async def get_group_context(
    org_id: Optional[int] = None,  # NOTE - This comes from our route!
    group_id: Optional[
        int
    ] = None,  # NOTE - This comes from our route for group endpoints!
    user: User = Depends(get_auth_user),
) -> Optional[int]:
    # Look for a group context in one of these places.
    # NOTE - user.group_id is going to go away soon but we need it temporarily.
    group = group_id or org_id or user.group_id
    return group


async def get_user_roles(
    group_id: Optional[int] = Depends(get_group_context),
    user: User = Depends(get_auth_user),
    session: AsyncSession = Depends(get_db),
) -> MutableSequence[UserRole]:
    # Figure out whether this user is a *direct member* of the group
    # we're trying to get context for.
    query = (
        sa.select(UserRole)  # type: ignore
        .options(  # type: ignore
            joinedload(UserRole.role, innerjoin=True),  # type: ignore
            joinedload(UserRole.group, innerjoin=True),  # type: ignore
        )
        .filter(UserRole.user == user)  # type: ignore
        .filter(UserRole.group_id == group_id)  # type: ignore
    )
    rolewait = await session.execute(query)
    user_roles = rolewait.unique().scalars().all()
    return user_roles


async def get_auth_context(
    group_id: Optional[int] = Depends(get_group_context),
    user: User = Depends(get_auth_user),
    session: AsyncSession = Depends(get_db),
    user_roles: MutableSequence[UserRole] = Depends(get_user_roles),
) -> AuthContext:
    group = None
    roles: List[str] = []
    groles: List[ACGroupRole] = []
    # Figure out whether we can attach a group to this auth context
    for row in user_roles:
        roles.append(row.role.name)
        group = row.group
    if group:
        query = (
            sa.select(GroupRole)  # type: ignore
            .options(  # type: ignore
                joinedload(GroupRole.role, innerjoin=True),  # type: ignore
                joinedload(GroupRole.grantor_group, innerjoin=True),  # type: ignore
            )
            .filter(GroupRole.grantee_group_id == group_id)  # type: ignore
        )
        rolewait = await session.execute(query)
        group_roles = rolewait.unique().scalars().all()
        for row in group_roles:
            groles.append({"group_id": row.grantor_group.id, "role": row.role.name})

    # Generate an auth context with or without group info.
    ac = AuthContext(user, group, roles, groles)
    return ac


# We *specifically* want to allow authcontexts to be generated without
# group context in several situations, however some endpoints *require*
# a group role, so this is here to enforce that requirement.
# This is a *stopgap* -- it's better to integrate Oso to do endpoint-level
# policy enforcement, which will let us check membership and access more flexibly.
async def require_group_membership(
    ac: AuthContext = Depends(get_auth_context),
):
    # If you don't have any roles in this group, go away
    if not ac.group:
        raise ex.UnauthorizedException("Not authorized")
