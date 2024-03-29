from typing import List, Optional
from uuid import uuid1

from sqlalchemy.ext.asyncio import AsyncSession

from aspen.auth.role_manager import RoleManager
from aspen.database.models import Group, Location, User
from aspen.database.models.base import base


def group_factory(
    name="groupname",
    address="123 Main St",
    prefix=None,
    location=None,
    division=None,
    default_tree_location: Optional[Location] = None,
    auth0_org_id=None,
) -> Group:
    # shortcut so we don't need to specify prefix
    if not prefix:
        prefix = name
    # Note - the None checks are to allow explicitly empty location/division strings
    if location is None:
        location = f"{name} city"
    if division is None:
        division = f"{name} state"
    if default_tree_location is None:
        default_tree_location = Location(
            region="North America", country="USA", location=location, division=division
        )
    if auth0_org_id is None:
        auth0_org_id = f"org_test_{uuid1()}"
    return Group(
        name=name,
        address=address,
        prefix=prefix,
        location=location,
        division=division,
        default_tree_location=default_tree_location,
        auth0_org_id=auth0_org_id,
    )


def user_factory(
    group: Optional[Group] = None,
    name="test",
    auth0_user_id="test_auth0_id",
    email="test_user@dph.org",
    system_admin=False,
    agreed_to_tos=True,
) -> User:
    user = User(
        name=name,
        auth0_user_id=auth0_user_id,
        email=email,
        system_admin=system_admin,
        agreed_to_tos=agreed_to_tos,
    )
    return user


async def userrole_factory(
    db: AsyncSession,
    group: Group,
    name="test",
    auth0_user_id="test_auth0_id",
    email="test_user@dph.org",
    roles=["member"],
    system_admin=False,
    agreed_to_tos=True,
) -> User:
    user = User(
        name=name,
        auth0_user_id=auth0_user_id,
        email=email,
        system_admin=system_admin,
        agreed_to_tos=agreed_to_tos,
    )
    for role in roles:
        user.user_roles.append(
            await RoleManager.generate_user_role(db, user, group, role)
        )
    return user


async def grouprole_factory(
    db: AsyncSession, owner_group: Group, viewer_group: Group, role_name: str = "viewer"
) -> List[base]:
    model_objs = []
    model_objs.append(
        await RoleManager.generate_group_role(db, owner_group, viewer_group, role_name)
    )
    return model_objs
