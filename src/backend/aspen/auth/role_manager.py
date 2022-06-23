import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.database.models import Group, Role, User, UserRole


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
    async def generate_user_role(
        cls, db: AsyncSession, user: User, group: Group, role_name: str
    ) -> UserRole:
        role = await cls.get_role_by_name(db, role_name)
        ur = UserRole(user=user, group=group, role=role)
        return ur
