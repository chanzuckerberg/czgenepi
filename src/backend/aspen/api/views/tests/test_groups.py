import pytest
from auth0.v3.exceptions import Auth0Error
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.api.views.tests.data.auth0_mock_responses import (
    DEFAULT_AUTH0_INVITATION,
    DEFAULT_AUTH0_ORG,
    DEFAULT_AUTH0_USER,
)
from aspen.auth.auth0_management import Auth0Client
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.usergroup import group_factory, userrole_factory

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


async def test_list_members(
    http_client: AsyncClient, async_session: AsyncSession
) -> None:
    group = group_factory()
    user = await userrole_factory(async_session, 
        group, name="Bob", auth0_user_id="testid02", email="bob@dph.org"
    )
    user2 = await userrole_factory(async_session, 
        group,
        name="Alice",
        auth0_user_id="testid01",
        email="alice@dph.org",
        roles=["admin"]
    )
    async_session.add(group)
    await async_session.commit()

    response = await http_client.get(
        f"/v2/groups/{group.id}/members/", headers={"user_id": user.auth0_user_id}
    )
    assert response.status_code == 200
    expected = {
        "members": [
            {
                "id": user2.id,
                "name": user2.name,
                "agreed_to_tos": True,
                "acknowledged_policy_version": None,
                "email": user2.email,
                "group_admin": True,
            },
            {
                "id": user.id,
                "name": user.name,
                "agreed_to_tos": True,
                "acknowledged_policy_version": None,
                "email": user.email,
                "group_admin": False,
            },
        ]
    }
    resp_data = response.json()
    for key in expected:
        assert resp_data[key] == expected[key]


async def test_list_members_unauthorized(
    http_client: AsyncClient, async_session: AsyncSession
) -> None:
    group = group_factory()
    group2 = group_factory(name="test_group2")
    user = await userrole_factory(async_session, 
        group, name="Bob", auth0_user_id="testid02", email="bob@dph.org"
    )
    user2 = await userrole_factory(async_session, 
        group2, name="Alice", auth0_user_id="testid01", email="alice@dph.org"
    )
    async_session.add_all([group, group2, user, user2])
    await async_session.commit()

    response = await http_client.get(
        f"/v2/groups/{group2.id}/members/", headers={"user_id": user.auth0_user_id}
    )
    assert response.status_code == 403


async def test_send_group_invitations(
    # Technically Auth0Client will be a magicmock, but we want mypy to treat it like an auth0 client.
    auth0_apiclient: Auth0Client,
    http_client: AsyncClient,
    async_session: AsyncSession,
) -> None:
    group = group_factory()
    user = await userrole_factory(async_session, group)
    async_session.add_all([group, user])
    await async_session.commit()

    auth0_apiclient.get_org_by_name.return_value = DEFAULT_AUTH0_ORG  # type: ignore
    auth0_apiclient.get_user_by_email.side_effect = [[], [], [DEFAULT_AUTH0_USER]]  # type: ignore
    auth0_apiclient.invite_member.side_effect = [  # type: ignore
        True,
        Auth0Error(True, 500, "something broke"),
    ]
    create_invitations_request = {
        "role": "member",
        "emails": [
            "success@onetwothree.com",
            "exception@onetwothree.com",
            "alreadyexists@onetwothree.com",
        ],
    }
    response = await http_client.post(
        f"/v2/groups/{group.id}/invitations/",
        headers={"user_id": user.auth0_user_id},
        json=create_invitations_request,
    )

    assert response.status_code == 200
    resp_data = response.json()
    assert "invitations" in resp_data
    invitations = {item["email"]: item["success"] for item in resp_data["invitations"]}
    expected = {
        "success@onetwothree.com": True,
        "alreadyexists@onetwothree.com": False,
        "exception@onetwothree.com": False,
    }
    assert invitations == expected


async def test_list_group_invitations(
    auth0_apiclient: Auth0Client, http_client: AsyncClient, async_session: AsyncSession
) -> None:
    group = group_factory()
    user = await userrole_factory(async_session, group)
    async_session.add_all([group, user])
    await async_session.commit()

    auth0_apiclient.get_org_by_id.side_effect = [DEFAULT_AUTH0_ORG]  # type: ignore
    auth0_apiclient.get_org_invitations.side_effect = [[DEFAULT_AUTH0_INVITATION]]  # type: ignore
    response = await http_client.get(
        f"/v2/groups/{group.id}/invitations/", headers={"user_id": user.auth0_user_id}
    )

    assert response.status_code == 200
    resp_data = response.json()
    assert "invitations" in resp_data
    invitations = resp_data["invitations"]
    assert isinstance(invitations, list)
    assert (
        invitations[0]["invitee"]["email"]
        == DEFAULT_AUTH0_INVITATION["invitee"]["email"]
    )


async def test_list_group_invitations_unauthorized(
    http_client: AsyncClient, async_session: AsyncSession
) -> None:
    group = group_factory()
    group2 = group_factory(name="test_group2")
    user = await userrole_factory(async_session, 
        group, name="Bob", auth0_user_id="testid02", email="bob@dph.org"
    )
    user2 = await userrole_factory(async_session, 
        group2, name="Alice", auth0_user_id="testid01", email="alice@dph.org"
    )
    async_session.add_all([group, group2, user, user2])
    await async_session.commit()

    response = await http_client.get(
        f"/v2/groups/{group2.id}/invitations/", headers={"user_id": user.auth0_user_id}
    )
    assert response.status_code == 403


async def test_create_group(
    auth0_apiclient: Auth0Client, http_client: AsyncClient, async_session: AsyncSession
) -> None:
    group = group_factory(division="California", location="San Mateo County")
    user = await userrole_factory(async_session, 
        group,
        name="Alice",
        auth0_user_id="admin_id_01",
        email="alice@chanzuckerberg.com",
        system_admin=True,
    )
    location = location_factory(
        region="North America",
        country="USA",
        division="California",
        location="Alameda County",
    )
    async_session.add_all([group, user, location])
    await async_session.commit()

    create_group_request = {
        "name": "Alameda County Department of Public Health",
        "prefix": "ALAMEDA-CA",
        "address": "123 Telegraph Ave., Oakland, CA 94612",
        "division": "California",
        "location": "Alameda County",
        "default_tree_location_id": location.id,
    }

    auth0_apiclient.add_org.side_effect = [DEFAULT_AUTH0_ORG]  # type: ignore
    response = await http_client.post(
        "/v2/groups/",
        headers={"user_id": user.auth0_user_id},
        json=create_group_request,
    )
    assert response.status_code == 200

    resp_data = response.json()

    assert resp_data["address"] == create_group_request["address"]
    assert resp_data["name"] == create_group_request["name"]
    assert resp_data["prefix"] == create_group_request["prefix"]
    assert isinstance(resp_data["id"], int)

    resp_loc = resp_data["default_tree_location"]
    assert resp_loc["region"] == location.region
    assert resp_loc["country"] == location.country
    assert resp_loc["division"] == location.division
    assert resp_loc["location"] == location.location
    assert isinstance(resp_loc["id"], int)


async def test_create_group_unauthorized(
    http_client: AsyncClient, async_session: AsyncSession
) -> None:
    group = group_factory(division="California", location="San Mateo County")
    user = await userrole_factory(async_session, 
        group,
        name="Alice",
        auth0_user_id="auth0_id_01",
        email="alice@chanzuckerberg.com",
        system_admin=False,
    )
    location = location_factory(
        region="North America",
        country="USA",
        division="California",
        location="Alameda County",
    )
    async_session.add_all([group, user, location])
    await async_session.commit()

    create_group_request = {
        "name": "Alameda County Department of Public Health",
        "prefix": "ALAMEDA-CA",
        "address": "123 Telegraph Ave., Oakland, CA 94612",
        "division": "California",
        "location": "Alameda County",
        "default_tree_location_id": location.id,
    }

    response = await http_client.post(
        "/v2/groups/",
        headers={"user_id": user.auth0_user_id},
        json=create_group_request,
    )
    assert response.status_code == 403
