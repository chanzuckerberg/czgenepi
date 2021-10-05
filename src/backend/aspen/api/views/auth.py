import os
from urllib.parse import urlencode

from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from starlette.requests import Request

import aspen.api.error as ex
from aspen.api.config.config import settings
from aspen.database.models.usergroup import User

# From the example here:
# https://github.com/authlib/demo-oauth-client/tree/master/fastapi-google-login
router = APIRouter()

oauth = OAuth()
auth0 = oauth.register(
    "auth0",
    client_id=settings.AUTH0_CLIENT_ID,
    client_secret=settings.AUTH0_CLIENT_SECRET,
    api_base_url=settings.AUTH0_BASE_URL,
    access_token_url=settings.AUTH0_ACCESS_TOKEN_URL,
    authorize_url=settings.AUTH0_AUTHORIZE_URL,
    client_kwargs=settings.AUTH0_CLIENT_KWARGS,
)


@router.get("/login")
async def login(request: Request):
    return await auth0.authorize_redirect(request, settings.AUTH0_CALLBACK_URL)


@router.get("/callback")
async def auth(request: Request):
    try:
        token = await auth0.authorize_access_token(request)
    except OAuthError as error:
        raise ex.UnauthorizedException("Invalid token")
    userinfo = token.get("userinfo")
    if userinfo:
        # Store the user information in flask session.
        request.session["jwt_payload"] = userinfo
        request.session["profile"] = {
            "user_id": userinfo["sub"],
            "name": userinfo["name"],
        }
    return RedirectResponse(os.getenv("FRONTEND_URL") + "/data/samples")

    # Store the user information in flask session.
    request.session["jwt_payload"] = userinfo
    request.session["profile"] = {
        "user_id": userinfo["sub"],
        "name": userinfo["name"],
    }


@router.get("/logout")
async def logout(request: Request):
    # Clear session stored data
    request.session.pop("jwt_payload", None)
    request.session.pop("profile", None)
    # Redirect user to logout endpoint
    params = {
        "returnTo": os.getenv("FRONTEND_URL"),
        "client_id": settings.AUTH0_CLIENT_ID,
    }
    return RedirectResponse(f"{settings.AUTH0_LOGOUT_URL}?{urlencode(params)}")
