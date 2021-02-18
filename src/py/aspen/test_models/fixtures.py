import pytest

from ..database.models.usergroup import Group, User


@pytest.fixture(scope="function")
def group(session):
    group = Group(name="groupname", email="groupemail", address="123 Main St")
    session.add(group)
    session.commit()
    return group


@pytest.fixture(scope="function")
def user(session, group):
    user = User(
        name="test",
        auth0_user_id="test_auth0_id",
        email="test_user@dph.org",
        group_admin=True,
        system_admin=True,
        group=group,
    )
    session.add(user)
    session.commit()
    return user
