"""add user roles

Create Date: 2022-03-31 23:21:53.865128

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220616_232148"
down_revision = "20220616_232147"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "group_roles",
        sa.Column(
            "role_id",
            sa.INTEGER(),
            sa.ForeignKey("aspen.roles.id"),
            index=True,
            autoincrement=False,
            nullable=False,
        ),
        sa.Column(
            "grantor_group_id",
            sa.INTEGER(),
            sa.ForeignKey("aspen.groups.id"),
            index=True,
            autoincrement=False,
            nullable=False,
            primary_key=True,
        ),
        sa.Column(
            "grantee_group_id",
            sa.INTEGER(),
            sa.ForeignKey("aspen.groups.id"),
            index=True,
            autoincrement=False,
            nullable=False,
            primary_key=True,
        ),
        schema="aspen",
    )


def downgrade():
    pass
