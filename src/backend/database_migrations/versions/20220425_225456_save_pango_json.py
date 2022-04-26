"""save pango json

Create Date: 2022-04-25 22:55:03.018662

"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "20220425_225456"
down_revision = "20220419_110151"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "pathogen_genomes",
        sa.Column(
            "pangolin_output",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'{}'::jsonb"),
            nullable=True,
        ),
        schema="aspen",
    )


def downgrade():
    raise NotImplementedError("don't downgrade")
