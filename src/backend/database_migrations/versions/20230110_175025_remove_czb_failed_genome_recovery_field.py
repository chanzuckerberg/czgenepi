"""drop the czb failed genome recovery column

Create Date: 2023-01-10 17:50:35.250700

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = "20230110_175025"
down_revision = "20230109_223207"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_column("samples", "czb_failed_genome_recovery", schema="aspen")


def downgrade():
    raise NotImplementedError("Downgrade not supported.")
