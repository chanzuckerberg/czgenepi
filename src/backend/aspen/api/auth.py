import logging

import sqlalchemy as sa
from auth0.v3.exceptions import TokenValidationError
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.orm.query import Query
from starlette.requests import Request

import aspen.api.error.http_exceptions as ex
from aspen.api.deps import get_db
from aspen.api.settings import get_settings
from aspen.auth.device_auth import validate_auth_header
from aspen.database.models import Group, User


def get_usergroup_query(session: AsyncSession, user_id: str) -> Query:
    return (
        sa.select(User)  # type: ignore
        .options(joinedload(User.group).joinedload(Group.can_see))  # type: ignore
        .filter(User.auth0_user_id == user_id)  # type: ignore
    )


async def setup_userinfo(user_id):
    # sentry_sdk.set_user( { "requested_user_id": user_id, })
    session = get_db()
    try:
        userquery = get_usergroup_query(session, user_id)
        userwait = await session.execute(userquery)
        user = userwait.unique().scalars().first()
    except NoResultFound:
        # sentry_sdk.capture_message(
        #     f"Requested auth0_user_id {user_id} not found in usergroup query."
        # )
        return None
    # sentry_sdk.set_user(
    #     {
    #         "id": user.id,
    #         "auth0_uid": user.auth0_user_id,
    #     }
    # )
    return user


async def get_auth_user(request: Request):
    settings = get_settings()
    auth_header = request.headers.get("authorization")
    auth0_user_id = None
    if auth_header:
        try:
            payload = validate_auth_header(
                auth_header, settings.AUTH0_DOMAIN, settings.AUTH0_CLIENT_ID
            )
            auth0_user_id = payload["sub"]
        except TokenValidationError as err:
            logging.warn(f"Token validation error: {err}")
    elif "profile" in request.session:
        auth0_user_id = request.session["profile"].get("user_id")
    # Redirect to Login page
    if not auth0_user_id:
        # TODO - redirect to login.
        raise Exception("No Userid Found!")
    found_auth_user = await setup_userinfo(auth0_user_id)
    if not found_auth_user:
        # login attempt from user not in DB
        # TODO - redirect to login.
        raise Exception("No Userid Found!")
    # There's a starlette-context module that allows us to manage
    # per-request data without depending on having a request object
    # available. For now we seem to have `request` when we need it,
    # but we can change this if necessary.
    request.state.auth_user = found_auth_user
    return found_auth_user


async def get_admin_user(auth_user=Depends(get_auth_user)):
    if not auth_user.system_admin:
        raise ex.UnauthorizedException("Not authorized")
