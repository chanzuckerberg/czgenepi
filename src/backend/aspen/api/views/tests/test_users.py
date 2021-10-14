from aspen.api.main import app
import pytest
from fastapi import Request
from aspen.api.auth import get_auth_user
from aspen.test_infra.models.usergroup import group_factory, user_factory
import pytest

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


#async def override_get_auth_user(request: Request):
    #group = group_factory()
    #user = user_factory(group)
    #async_session.add(group)
    #async_session.commit()
    #return user


# app.dependency_overrides[get_auth_user] = override_get_auth_user

async def test_users_me(fastapi_client, async_session):
    group = group_factory()
    user = user_factory(group)
    async_session.add(group)
    await async_session.commit()

    response = await fastapi_client.get("/v2/users/me")
    assert response.status_code == 200
    assert response.json() == {"healthy": True}
