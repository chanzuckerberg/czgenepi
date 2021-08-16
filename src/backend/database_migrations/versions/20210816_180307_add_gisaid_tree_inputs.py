"""add gisaid tree inputs

Create Date: 2021-08-16 18:03:09.954223

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "20210816_180307"
down_revision = "20210813_172344"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "phylo_runs",
        sa.Column(
            "gisaid_ids",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'[]'::jsonb"),
            nullable=False,
        ),
        schema="aspen",
    )


def downgrade():
    # don't downgrade.
    pass
