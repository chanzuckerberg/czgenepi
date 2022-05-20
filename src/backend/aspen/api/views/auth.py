import os
from urllib.parse import urlencode

from authlib.integrations.base_client.errors import OAuthError
from authlib.integrations.starlette_client import StarletteOAuth2App
from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from starlette.requests import Request
from starlette.responses import Response

import aspen.api.error.http_exceptions as ex
from aspen.api.deps import get_auth0_client, get_settings
from aspen.api.settings import Settings

# From the example here:
# https://github.com/authlib/demo-oauth-client/tree/master/fastapi-google-login
router = APIRouter()


@router.get("/login")
async def login(
    request: Request,
    auth0: StarletteOAuth2App = Depends(get_auth0_client),
    settings: Settings = Depends(get_settings),
) -> Response:
    return await auth0.authorize_redirect(request, settings.AUTH0_CALLBACK_URL)


@router.get("/callback")
async def auth(
    request: Request,
    auth0: StarletteOAuth2App = Depends(get_auth0_client),
    settings: Settings = Depends(get_settings),
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
