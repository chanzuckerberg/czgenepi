from aspen.database.models import Group, User


def group_factory(
    name="groupname",
    address="123 Main St",
    prefix=None,
    location="Metropolis",
    division="West",
) -> Group:
    # shortcut so we don't need to specify prefix
    if not prefix:
        prefix = name
    return Group(
        name=name,
        address=address,
        prefix=prefix,
        location=location,
        division=division,
    )


def user_factory(
    group: Group,
    name="test",
    auth0_user_id="test_auth0_id",
    email="test_user@dph.org",
    group_admin=False,
    system_admin=False,
    agreed_to_tos=True,
) -> User:
    return User(
        name=name,
        auth0_user_id=auth0_user_id,
        email=email,
        group_admin=group_admin,
        system_admin=system_admin,
        agreed_to_tos=agreed_to_tos,
        group=group,
    )
