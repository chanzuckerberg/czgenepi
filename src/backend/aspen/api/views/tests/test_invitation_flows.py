from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from urllib.parse import parse_qsl, urlparse

import pytest
import sqlalchemy as sa
from authlib.integrations.starlette_client import StarletteOAuth2App
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from httpx import AsyncClient
from httpx._models import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from sqlalchemy.sql.expression import and_

from aspen.api.middleware.session import SessionMiddleware
from aspen.auth.auth0_management import Auth0Client, Auth0OrgInvitation
from aspen.database.models import Group, User, UserRole
from aspen.test_infra.models.usergroup import group_factory, user_factory
from aspen.util.split import SplitClient

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


async def setup_invitation_flows(
    async_session: AsyncSession,
    auth0_apiclient: Auth0Client,
    auth0_oauth: StarletteOAuth2App,
    split_client: SplitClient,
):
    """
    Test most of the flows that lead to accepting organization invitations
    """
    group = group_factory(auth0_org_id="test_org")
    user1 = user_factory(
        name="Existing User",
        email="existing_user@czgenepi.org",
        auth0_user_id="existing_user",
        group=group,
    )
    user2 = user_factory(
        name="Another User",
        email="another_user@czgenepi.org",
        auth0_user_id="another_user",
        group=group,
    )
    async_session.add_all([group, user1, user2])
    await async_session.commit()

    # todo fix this
    userinfo = {
        "sub": "user123-asdf",
        "org_id": group.auth0_org_id,
        "email": "hello@czgenepi.org",
        "name": "user1",
    }

    split_client.get_flag.return_value = "on"  # type: ignore
    auth0_oauth.authorize_access_token.return_value = {"userinfo": userinfo}  # type: ignore
    return user1, user2, group


async def generate_invitation(
    auth0_apiclient: Auth0Client,
    group: Group,
    email: str,
    expires_at: Optional[datetime] = None,
) -> Tuple[Auth0OrgInvitation, Dict]:
    if not expires_at:
        expires_at = datetime.now() + timedelta(days=2)
    expiration_str = expires_at.isoformat()
    invitation: Auth0OrgInvitation = {
        "id": "foo",
        "organization_id": group.auth0_org_id,
        "invitee": {"email": email},
        "inviter": {"name": ""},
        "expires_at": expiration_str,
        "created_at": expiration_str,
        "ticket_id": "ticket_1",
        "roles": ["member"],
        "client_id": "",
        "invitation_url": "",
        "connection_id": "",
    }
    login_params = {
        "invitation": invitation["ticket_id"],
        "organization": group.auth0_org_id,
        "organization_name": group.name,
    }
    auth0_apiclient.get_org_invitations.return_value = [invitation]  # type: ignore
    return invitation, login_params


async def make_login_request(
    http_client: AsyncClient, login_params: Dict, auth_user: Optional[User] = None
) -> Response:
    auth_headers = {}
    if auth_user:
        auth_headers = {"user_id": auth_user.auth0_user_id}
    res = await http_client.get(
        "/v2/auth/login",
        params=login_params,
        headers=auth_headers,
        allow_redirects=False,
    )
    return res


async def test_redirect_without_prompt(
    async_session: AsyncSession,
    auth0_apiclient: Auth0Client,
    auth0_oauth: StarletteOAuth2App,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    """
    Invitation is expired but address is in db, or email doesn't exist in the db (redirect to auth0 w/o prompt)
    """
    user, _, group = await setup_invitation_flows(
        async_session=async_session,
        auth0_apiclient=auth0_apiclient,
        auth0_oauth=auth0_oauth,
        split_client=split_client,
    )

    auth_user = None
    test_cases: List[Tuple[str, Optional[datetime]]] = [
        (user.email, datetime.now() - timedelta(days=2)),
        ("zzyzx@czgenepi.org", None),
    ]

    auth0_oauth.authorize_redirect.return_value = RedirectResponse("/v2/auth/callback")  # type: ignore
    for test_case in test_cases:
        invitation_email, expires_at = test_case
        invitation, login_params = await generate_invitation(
            auth0_apiclient, group=group, email=invitation_email, expires_at=expires_at
        )
        res = await make_login_request(http_client, login_params, auth_user)

        assert res.headers["Location"] == "/v2/auth/callback"
        redirect_kwargs = auth0_oauth.authorize_redirect.call_args.kwargs
        assert redirect_kwargs["invitation"] == invitation["ticket_id"]
        assert redirect_kwargs["organization"] == group.auth0_org_id
        assert redirect_kwargs["organization_name"] == group.name


async def test_invitation_valid_and_logged_in(
    async_session: AsyncSession,
    auth0_apiclient: Auth0Client,
    auth0_oauth: StarletteOAuth2App,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    """
    Email exists and we're logged in as the right user (expect redirect to process_invitation)
    """
    user, _, group = await setup_invitation_flows(
        async_session=async_session,
        auth0_apiclient=auth0_apiclient,
        auth0_oauth=auth0_oauth,
        split_client=split_client,
    )

    auth_user = user
    invitation_email = user.email
    expires_at = None

    invitation, login_params = await generate_invitation(
        auth0_apiclient, group=group, email=invitation_email, expires_at=expires_at
    )

    res = await make_login_request(http_client, login_params, auth_user)

    _, _, path, _, query, _ = urlparse(res.headers["Location"])
    query_params = dict(parse_qsl(query))
    assert "process_invitation" in path
    assert query_params["invitation"] == invitation["ticket_id"]
    assert query_params["organization"] == group.auth0_org_id


async def get_cookie(api: FastAPI, client: AsyncClient, response: Response):
    """
    Get the cookie from a response
    """
    cookie = client.cookies.get("session")
    sess_args = [
        mw.options for mw in api.user_middleware if mw.cls == SessionMiddleware
    ][0]
    sessionmanager = SessionMiddleware(api, **sess_args)
    return sessionmanager.decode_flask_cookie(cookie)


async def test_redirect_with_prompt(
    async_session: AsyncSession,
    auth0_apiclient: Auth0Client,
    auth0_oauth: StarletteOAuth2App,
    http_client: AsyncClient,
    split_client: SplitClient,
    api: FastAPI,
):
    """
    if the email exists and we're either not logged in, or logged in as a different user, redirect to auth0 with a prompt
    """
    user1, user2, group = await setup_invitation_flows(
        async_session=async_session,
        auth0_apiclient=auth0_apiclient,
        auth0_oauth=auth0_oauth,
        split_client=split_client,
    )

    invitation_email = user2.email
    expires_at = None

    invitation, login_params = await generate_invitation(
        auth0_apiclient, group=group, email=invitation_email, expires_at=expires_at
    )
    auth0_oauth.authorize_redirect.return_value = RedirectResponse("/v2/auth/callback")  # type: ignore
    for auth_user in [user1, None]:
        res = await make_login_request(http_client, login_params, auth_user)

        assert res.headers["Location"] == "/v2/auth/callback"
        redirect_kwargs = auth0_oauth.authorize_redirect.call_args.kwargs
        assert redirect_kwargs["prompt"] == "login"
        assert redirect_kwargs["login_hint"] == invitation_email
        session_values = await get_cookie(api, http_client, res)
        assert session_values["process_invitation"] == {
            "invitation": invitation["ticket_id"],
            "organization": group.auth0_org_id,
            "organization_name": group.name,
        }


# Test callback endpoint with and without session stuff
async def test_callback_redirect(
    async_session: AsyncSession,
    auth0_apiclient: Auth0Client,
    auth0_oauth: StarletteOAuth2App,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    """
    Make sure the callback endpoint can redirect to the process_invitation endpoint if we have the appropriate session vars
    """
    user1, _, group = await setup_invitation_flows(
        async_session=async_session,
        auth0_apiclient=auth0_apiclient,
        auth0_oauth=auth0_oauth,
        split_client=split_client,
    )

    invitation_email = user1.email
    expires_at = None

    auth0_oauth.authorize_redirect.return_value = RedirectResponse("/v2/auth/callback")  # type: ignore
    invitation, login_params = await generate_invitation(
        auth0_apiclient, group=group, email=invitation_email, expires_at=expires_at
    )
    # Do this to set a cookie
    await make_login_request(http_client, login_params, None)
    # And make sure the callback can read that cookie
    auth_headers = {"user_id": user1.auth0_user_id}

    res = await http_client.get(
        "/v2/auth/callback",
        headers=auth_headers,
        allow_redirects=False,
    )
    assert "process_invitation" in res.headers["Location"]
    _, _, path, _, query, _ = urlparse(res.headers["Location"])
    query_params = dict(parse_qsl(query))
    assert "process_invitation" in path
    assert query_params["invitation"] == invitation["ticket_id"]
    assert query_params["organization"] == group.auth0_org_id
    assert query_params["organization_name"] == group.name


# Test process invitation endpoint successes.
async def test_process_invitation_success(
    async_session: AsyncSession,
    auth0_apiclient: Auth0Client,
    auth0_oauth: StarletteOAuth2App,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    """
    if the email exists and we're either not logged in, or logged in as a different user, redirect to auth0 with a prompt
    """
    user1, _, group = await setup_invitation_flows(
        async_session=async_session,
        auth0_apiclient=auth0_apiclient,
        auth0_oauth=auth0_oauth,
        split_client=split_client,
    )

    invitation_email = user1.email
    expires_at = None

    invitation, login_params = await generate_invitation(
        auth0_apiclient, group=group, email=invitation_email, expires_at=expires_at
    )
    auth_headers = {"user_id": user1.auth0_user_id}
    auth0_apiclient.get_user_orgs.side_effect = [[{"id": group.auth0_org_id}]]  # type: ignore
    auth0_apiclient.get_org_user_roles.side_effect = [["admin"]]  # type: ignore
    res = await http_client.get(
        "/v2/auth/process_invitation",
        params=login_params,
        headers=auth_headers,
        allow_redirects=False,
    )
    auth0_org = {"id": group.auth0_org_id, "display_name": "", "name": ""}
    auth0_apiclient.add_org_member.assert_called_once_with(  # type: ignore
        auth0_org, user1.auth0_user_id, ["member"], False
    )
    auth0_apiclient.delete_organization_invitation.assert_called_once_with(  # type: ignore
        group.auth0_org_id, invitation["id"]
    )
    # make sure user roles made it to the db.
    userrole = (await async_session.execute(sa.select(UserRole).options(joinedload(UserRole.role)).where(and_(UserRole.user_id == user1.id, UserRole.group_id == group.id)))).scalars().one()  # type: ignore
    assert userrole.role.name == "admin"
    # Make sure we redirected to the correct welcome
    assert f"/welcome/{group.id}" in res.headers["Location"]


# Test process invitation endpoint successes.
async def test_process_invitation_failures(
    async_session: AsyncSession,
    auth0_apiclient: Auth0Client,
    auth0_oauth: StarletteOAuth2App,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    """
    if the email exists and we're either not logged in, or logged in as a different user, redirect to auth0 with a prompt
    """
    user1, user2, group = await setup_invitation_flows(
        async_session=async_session,
        auth0_apiclient=auth0_apiclient,
        auth0_oauth=auth0_oauth,
        split_client=split_client,
    )

    expires_at = None
    auth0_oauth.authorize_redirect.return_value = RedirectResponse("/v2/auth/callback")  # type: ignore

    # Make sure if there's a mismatch between the logged in user and the invited user, we get an error
    invitation_email = user2.email
    _, login_params = await generate_invitation(
        auth0_apiclient, group=group, email=invitation_email, expires_at=expires_at
    )
    auth_headers = {"user_id": user1.auth0_user_id}
    res = await http_client.get(
        "/v2/auth/process_invitation",
        params=login_params,
        headers=auth_headers,
        allow_redirects=False,
    )
    assert res.status_code == 400

    # Make sure if the invitation is expired, we get redirected
    invitation_email = user1.email
    expires_at = datetime.now() - timedelta(days=2)
    invitation, login_params = await generate_invitation(
        auth0_apiclient, group=group, email=invitation_email, expires_at=expires_at
    )
    auth_headers = {"user_id": user1.auth0_user_id}
    res = await http_client.get(
        "/v2/auth/process_invitation",
        params=login_params,
        headers=auth_headers,
        allow_redirects=False,
    )
    assert res.headers["Location"] == "/v2/auth/callback"
    redirect_kwargs = auth0_oauth.authorize_redirect.call_args.kwargs
    assert redirect_kwargs["invitation"] == invitation["ticket_id"]
    assert redirect_kwargs["organization"] == group.auth0_org_id
    assert redirect_kwargs["organization_name"] == group.name

    # Make we get an auth failure if the user is not logged in
    invitation_email = user1.email
    invitation, login_params = await generate_invitation(
        auth0_apiclient, group=group, email=invitation_email, expires_at=expires_at
    )
    auth_headers = {}
    res = await http_client.get(
        "/v2/auth/process_invitation",
        params=login_params,
        headers=auth_headers,
        allow_redirects=False,
    )
    assert res.status_code == 401
