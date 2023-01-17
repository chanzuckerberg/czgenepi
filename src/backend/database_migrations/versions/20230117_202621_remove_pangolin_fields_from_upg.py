"""remove pangolin fields from uploaded_pathogen_genomes

Create Date: 2023-01-17 20:26:29.073222

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "20230117_202621"
down_revision = "20230110_175025"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_column("pathogen_genomes", "pangolin_version", schema="aspen")
    op.drop_column("pathogen_genomes", "pangolin_output", schema="aspen")
    op.drop_column("pathogen_genomes", "pangolin_lineage", schema="aspen")
    op.drop_column("pathogen_genomes", "pangolin_probability", schema="aspen")
    op.drop_column("pathogen_genomes", "pangolin_last_updated", schema="aspen")
    op.alter_column(
        "sample_qc_metrics",
        "sample_id",
        existing_type=sa.INTEGER(),
        nullable=False,
        schema="aspen",
    )


def downgrade():
    raise NotImplementedError("Downgrade not supported.")