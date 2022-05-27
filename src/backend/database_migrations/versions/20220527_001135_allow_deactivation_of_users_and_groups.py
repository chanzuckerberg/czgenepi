"""Allow deactivation of users and groups

Create Date: 2022-05-27 00:11:40.525205

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220527_001135"
down_revision = "20220524_174911"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "groups",
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.sql.expression.true()),
        nullable=False,
        schema="aspen",
    )
    op.alter_column(
        "groups",
        "auth0_org_id",
        nullable=True,
        schema="aspen",
    )

    op.add_column(
        "users",
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.sql.expression.true()),
        nullable=False,
        schema="aspen",
    )
    op.alter_column(
        "users",
        "auth0_user_id",
        nullable=True,
        schema="aspen",
    )


def downgrade():
    pass
