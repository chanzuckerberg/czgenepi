import os
from functools import lru_cache
from urllib.parse import urlencode

from authlib.integrations.base_client.errors import OAuthError
from authlib.integrations.starlette_client import OAuth, StarletteRemoteApp
from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from starlette.requests import Request

import aspen.api.error.http_exceptions as ex
from aspen.api.settings import get_settings, Settings

# From the example here:
# https://github.com/authlib/demo-oauth-client/tree/master/fastapi-google-login
router = APIRouter()


@lru_cache
def get_auth0_client() -> StarletteRemoteApp:
    # TODO - settings is an unhashable type, so we can't make it a Dependency
    # *and* use the lru_cache decorator on this getter. We should probably use
    # fastapi's built-in dependency caching instead of lru_cache here, but
    # it needs a little more thought first.
    # see: https://github.com/tiangolo/fastapi/issues/1985
    settings: Settings = get_settings()
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
    return auth0


@router.get("/login")
async def login(
    request: Request,
    auth0=Depends(get_auth0_client),
    settings: Settings = Depends(get_settings),
):
    return await auth0.authorize_redirect(request, settings.AUTH0_CALLBACK_URL)


@router.get("/callback")
async def auth(request: Request, auth0=Depends(get_auth0_client)):
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
    return RedirectResponse(os.getenv("FRONTEND_URL", "") + "/data/samples")

    # Store the user information in flask session.
    request.session["jwt_payload"] = userinfo
    request.session["profile"] = {
        "user_id": userinfo["sub"],
        "name": userinfo["name"],
    }


@router.get("/logout")
async def logout(request: Request, settings: Settings = Depends(get_settings)):
    # Clear session stored data
    request.session.pop("jwt_payload", None)
    request.session.pop("profile", None)
    # Redirect user to logout endpoint
    params = {
        "returnTo": os.getenv("FRONTEND_URL"),
        "client_id": settings.AUTH0_CLIENT_ID,
    }
    return RedirectResponse(f"{settings.AUTH0_LOGOUT_URL}?{urlencode(params)}")
