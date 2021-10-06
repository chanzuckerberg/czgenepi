from auth0.v3.authentication.token_verifier import (
    AsymmetricSignatureVerifier,
    JwksFetcher,
    TokenVerifier,
)
from auth0.v3.exceptions import TokenValidationError
from authlib.integrations.flask_client import OAuth
from starlette.requests import Request
from aspen.database.models import Group, User
from sqlalchemy.orm import joinedload
from sqlalchemy.orm.exc import NoResultFound
from aspen.api.deps import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.query import Query
from sqlalchemy.orm.session import Session
from sqlalchemy.sql.expression import and_, or_
import sqlalchemy as sa

def get_usergroup_query(session: AsyncSession, user_id: str) -> Query:
    return (
        sa.select(User)
        .options(joinedload(User.group).joinedload(Group.can_see))
        .filter(User.auth0_user_id == user_id)
    )


async def setup_userinfo(user_id):
    # sentry_sdk.set_user( { "requested_user_id": user_id, })
    session = get_db()
    try:
        userquery = get_usergroup_query(session, user_id)
        userwait = await session.execute(userquery)
        user = userwait.unique().one()
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
    auth_header = request.headers.get("authorization")
    auth0_user_id = None
    #if auth_header:
    #    try:
    #        payload = validate_auth_header(auth_header)
    #        auth0_user_id = payload["sub"]
    #    except TokenValidationError as err:
    #        application.logger.warn(f"Token validation error: {err}")
    #elif "profile" in session:
    if "profile" in request.session:
        auth0_user_id = request.session["profile"]["user_id"]
    # Redirect to Login page
    if not auth0_user_id:
        # TODO - redirect to login.
        raise Exception("No Userid Found!")
    found_auth_user = await setup_userinfo(auth0_user_id)
    if not found_auth_user:
        # login attempt from user not in DB
        # TODO - redirect to login.
        raise Exception("No Userid Found!")
    else:
        request.state.auth_user = found_auth_user
