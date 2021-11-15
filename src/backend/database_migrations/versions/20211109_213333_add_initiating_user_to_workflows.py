"""add initiating user to workflows

Create Date: 2021-11-09 21:33:35.169188

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20211109_213333"
down_revision = "20211015_205900"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "workflows",
        sa.Column("user_id", sa.Integer(), nullable=True),
        schema="aspen",
    )
    op.create_foreign_key(
        op.f("fk_workflows_user_id"),
        "workflows",
        "users",
        ["user_id"],
        ["id"],
        source_schema="aspen",
        referent_schema="aspen",
    )


def downgrade():
    # Don't downgrade.
    pass
