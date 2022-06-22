"""Migrate to new user/groups format.

Create Date: 2022-06-21 23:21:48.865128

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220621_232148"
down_revision = "20220616_232147"
branch_labels = None
depends_on = None


def upgrade():
    op.create_unique_constraint(  # type: ignore
        "uq_user_roles_user_group_role", "user_roles", ["user_id", "group_id", "role_id"], schema="aspen"
    )
    op.create_unique_constraint(  # type: ignore
        "uq_group_roles_grantee_grantor_role", "group_roles", ["grantee_group_id", "grantor_group_id", "role_id"], schema="aspen"
    )

    conn = op.get_bind()
    user_role_inserts = sa.sql.text(
        "INSERT INTO aspen.user_roles (role_id, user_id, group_id) SELECT IF(users.group_admin, admin_role.id, member_role.id), user_id, group_id FROM aspen.users AS users "
        "LEFT JOIN aspen.roles admin_role ON admin_role.name = 'admin' "
        "LEFT JOIN aspen.roles member_role ON member_role.name = 'member' "
        "ON CONFLICT DO NOTHING "
    )
    conn.execute(user_role_inserts)

    group_role_inserts = sa.sql.text(
        "INSERT INTO aspen.group_roles (role_id, grantor_group_id, grantee_group_id) "
        "SELECT role.id, owner_group_id, viewer_group_id FROM aspen.can_see "
        "LEFT JOIN aspen.roles AS roles on roles.name = 'viewer' WHERE data_type = 'TREES' "
    )
    conn.execute(user_role_inserts)


def downgrade():
    pass
