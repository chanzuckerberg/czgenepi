"""Make sample_qc_metrics.qc_score nullable

Create Date: 2022-11-28 22:09:52.798654

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20221128_220950"
down_revision = "20221122_231047"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        "sample_qc_metrics",
        "qc_score",
        existing_type=sa.VARCHAR(),
        nullable=True,
        schema="aspen",
    )


def downgrade():
    op.alter_column(
        "sample_qc_metrics",
        "qc_score",
        existing_type=sa.VARCHAR(),
        nullable=False,
        schema="aspen",
    )
