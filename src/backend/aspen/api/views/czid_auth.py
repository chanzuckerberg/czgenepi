import os
from urllib.parse import urlencode

from authlib.integrations.base_client.errors import OAuthError
from authlib.integrations.starlette_client import OAuth, StarletteRemoteApp
from fastapi import APIRouter, Depends
from starlette.requests import Request
from starlette.responses import Response

from aspen.api.deps import get_auth0_client, get_settings
from aspen.api.settings import Settings

# From the example here:
# https://github.com/authlib/demo-oauth-client/tree/master/fastapi-google-login
router = APIRouter()


@router.get("/login")
async def login(
    request: Request,
    redirect_uri: str,
    auth0: StarletteRemoteApp = Depends(get_auth0_client),
    settings: Settings = Depends(get_settings),
) -> Response:
    czid_oauth = OAuth()
    czid_auth0 = czid_oauth.register(
        "auth0",
        client_id=settings.CZID_CLIENT_ID,
        client_secret=settings.CZID_CLIENT_SECRET,
        api_base_url=settings.AUTH0_BASE_URL,
        access_token_url=settings.AUTH0_ACCESS_TOKEN_URL,
        authorize_url=settings.AUTH0_AUTHORIZE_URL,
        client_kwargs=settings.AUTH0_CLIENT_KWARGS,
    )
    return await czid_auth0.authorize_redirect(request, redirect_uri)
