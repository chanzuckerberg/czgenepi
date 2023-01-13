"""

Create Date: 2023-01-12 22:34:45.781948

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "20230112_223438"
down_revision = "20230110_175025"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_column("pathogen_genomes", "pangolin_probability", schema="aspen")
    op.drop_column("pathogen_genomes", "pangolin_lineage", schema="aspen")
    op.drop_column("pathogen_genomes", "pangolin_last_updated", schema="aspen")
    op.drop_column("pathogen_genomes", "pangolin_version", schema="aspen")


def downgrade():
    raise NotImplementedError("Downgrade not supported.")
