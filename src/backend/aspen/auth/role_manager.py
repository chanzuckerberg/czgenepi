import json
import sentry_sdk
from collections import defaultdict

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import contains_eager, joinedload
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

        old_groups = old_groups.unique().scalars().all()
        old_group_roles = defaultdict(dict)
        for old_group in old_groups:
            if not old_group.auth0_org_id:
                # This really shouldn't happen, but skip groups that don't make sense.
                continue
            for urole in old_group.user_roles:
                old_group_roles[old_group.auth0_org_id][urole.role.name] = urole

        current_group_roles = {}
        current_groups = a0.get_user_orgs(user.auth0_user_id)
        for group in current_groups:
            group_id = group["id"]
            current_roles = set(a0.get_org_user_roles(group_id, user.auth0_user_id))
            current_group_roles[group_id] = current_roles

        # Wipe out all roles for these groups.
        groups_to_delete = set(old_group_roles.keys()) - set(current_group_roles.keys())
        for groupid in groups_to_delete:
            for urole in old_group_roles[groupid].values():
                await db.delete(urole)

        # Add or update the rest.
        for org_id, roles in current_group_roles.items():
            existing_roles = set(old_group_roles[org_id].keys())
            new_roles = set(roles)
            for role in new_roles - existing_roles:
                try:
                    group = (
                        (
                            await db.execute(
                                sa.select(Group).where(Group.auth0_org_id == org_id)
                            )
                        )
                        .scalars()
                        .one()
                    )
                except NoResultFound:
                    # This also shouldn't happen, but we can freak out about it behind the scenes
                    sentry_sdk.capture_message(
                        f"Cannot sync membership for group ({org_id})"
                    )
                    continue 
                db.add(await cls.generate_user_role(db, user, group, role))
            for role in existing_roles - new_roles:
                await db.delete(old_group_roles[org_id][role])

        if False:
            for remove_role_name in old_roles - current_roles:
                await db.delete(old_roles_by_name[remove_role_name])
            for add_role_name in current_roles - old_roles:
                db.add(await cls.generate_user_role(db, user, old_group, add_role_name))
