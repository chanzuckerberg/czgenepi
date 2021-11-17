"""Add Country to Gisaid Metadata

Create Date: 2021-11-17 21:36:12.153099

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20211117_213610"
down_revision = "20211109_213333"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "gisaid_metadata",
        sa.Column(
            "gisaid_epi_isl",
            sa.String(),
            nullable=True,
        ),
        schema="aspen",
    )
    op.add_column(
        "gisaid_metadata",
        sa.Column(
            "country",
            sa.String(),
            nullable=True,
        ),
        schema="aspen",
    )


def downgrade():
    pass
