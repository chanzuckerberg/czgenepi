from typing import Dict, Set, Tuple

import sentry_sdk
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import contains_eager
from sqlalchemy.orm.exc import NoResultFound

from aspen.auth.auth0_management import Auth0Client
from aspen.database.models import Group, GroupRole, Role, User, UserRole


class RoleManager:
    """The start of a very simplistic user/group role manager, we'll see where this goes in the long run."""

    @classmethod
    async def get_role_by_name(cls, db: AsyncSession, role_name: str) -> Role:
        role = (
            (await db.execute(sa.select(Role).filter(Role.name == role_name)))  # type: ignore
            .scalars()
            .one()
        )
        return role

    @classmethod
    async def generate_group_role(
        cls,
        db: AsyncSession,
        grantor_group: Group,
        grantee_group: Group,
        role_name: str,
    ) -> GroupRole:
        role = await cls.get_role_by_name(db, role_name)
        gr = GroupRole(
            grantor_group=grantor_group, grantee_group=grantee_group, role=role
        )
        return gr

    @classmethod
    async def generate_user_role(
        cls, db: AsyncSession, user: User, group: Group, role_name: str
    ) -> UserRole:
        role = await cls.get_role_by_name(db, role_name)
        ur = UserRole(user=user, group=group, role=role)
        return ur

    @classmethod
    async def sync_user_roles(cls, db: AsyncSession, a0: Auth0Client, user: User):
        """
        Sync a user's auth0 organizations/roles to our db. Auth0 is the source of truth here!!
        This might be slightly overkill, but it should help to keep auth0 and our db in sync
        """
        old_groups = await db.execute(
            sa.select(Group)
            .join(UserRole, Group.user_roles)
            .join(Role, UserRole.role)  # type: ignore
            .options(  # type: ignore
                contains_eager(Group.user_roles).contains_eager(UserRole.role),  # type: ignore
            )
            .filter(UserRole.user == user)
        )

        old_groups_rows = old_groups.unique().scalars().all()
        old_roles: Set[Tuple[str, str]] = set()
        userrole_objs: Dict[Tuple[str, str], UserRole] = {}
        for old_group in old_groups_rows:
            for urole in old_group.user_roles:
                found_role = (old_group.auth0_org_id, urole.role.name)
                old_roles.add(found_role)
                userrole_objs[found_role] = urole

        current_roles: Set[Tuple[str, str]] = set()
        current_groups = a0.get_user_orgs(user.auth0_user_id)
        for group in current_groups:
            group_id = group["id"]
            group_roles = set(a0.get_org_user_roles(group_id, user.auth0_user_id))
            for role in group_roles:
                current_roles.add((group_id, role))

        # Wipe out any existing user roles that are no longer relevant
        roles_to_delete = old_roles - current_roles
        for rolerow in roles_to_delete:
            await db.delete(userrole_objs[rolerow])

        # Add or update the rest.
        roles_to_add = current_roles - old_roles
        for group_id, role_name in roles_to_add:
            try:
                group = (
                    (
                        await db.execute(
                            sa.select(Group).where(Group.auth0_org_id == group_id)
                        )
                    )
                    .scalars()
                    .one()
                )
            except NoResultFound:
                # This also shouldn't happen, but we can freak out about it behind the scenes
                sentry_sdk.capture_message(
                    f"Cannot sync membership for group ({group_id})"
                )
                continue
            db.add(await cls.generate_user_role(db, user, group, role_name))
