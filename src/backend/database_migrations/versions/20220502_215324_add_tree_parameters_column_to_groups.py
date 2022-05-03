"""add tree_parameters column to groups

Create Date: 2022-05-02 21:53:26.704275

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "20220502_215324"
down_revision = "20220502_171903"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "groups",
        sa.Column(
            "tree_parameters",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'{}'::jsonb"),
            nullable=True,
        ),
        schema="aspen",
    )


def downgrade():
    raise NotImplementedError("don't downgrade")
