"""make gisaid accession public_id nullable

Create Date: 2021-06-17 20:10:54.137206

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

revision = "20210617_201052"
down_revision = "20210615_155026"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        "gisaid_accessions",
        "public_identifier",
        existing_type=sa.VARCHAR(),
        nullable=True,
        schema="aspen",
    )


def downgrade():
    op.alter_column(
        "gisaid_accessions",
        "public_identifier",
        existing_type=sa.VARCHAR(),
        nullable=False,
        schema="aspen",
    )
