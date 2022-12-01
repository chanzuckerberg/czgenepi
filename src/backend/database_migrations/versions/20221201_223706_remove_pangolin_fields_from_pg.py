"""

Create Date: 2022-12-01 22:37:13.899799

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "20221201_223706"
down_revision = "20221201_174505"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_column("pathogen_genomes", "pangolin_output", schema="aspen")
    op.drop_column("pathogen_genomes", "pangolin_version", schema="aspen")
    op.drop_column("pathogen_genomes", "pangolin_lineage", schema="aspen")
    op.drop_column("pathogen_genomes", "pangolin_last_updated", schema="aspen")
    op.drop_column("pathogen_genomes", "pangolin_probability", schema="aspen")


def downgrade():
    raise NotImplementedError("Downgrading the DB is not allowed")
