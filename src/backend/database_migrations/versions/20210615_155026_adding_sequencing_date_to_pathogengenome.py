"""adding sequencing_date to pathogenGenome

Create Date: 2021-06-15 15:50:28.220371

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

revision = "20210615_155026"
down_revision = "20210602_224122"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "pathogen_genomes",
        sa.Column("sequencing_date", sa.Date(), nullable=True),
        schema="aspen",
    )


def downgrade():
    op.drop_column("pathogen_genomes", "sequencing_date", schema="aspen")
