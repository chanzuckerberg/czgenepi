"""Add gisaid_submitter_id to Users table

Create Date: 2022-08-09 23:47:38.212679

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220809_234732"
down_revision = "20220808_214216"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "users",
        sa.Column("gisaid_submitter_id", sa.String(), nullable=True),
        schema="aspen",
    )


def downgrade():
    raise NotImplementedError("Reversing this migration is not supported")
