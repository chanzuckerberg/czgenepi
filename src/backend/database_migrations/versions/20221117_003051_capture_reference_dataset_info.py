"""Capture reference dataset info

Create Date: 2022-11-17 00:30:52.641984

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20221117_003051"
down_revision = "20221101_001522"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "sample_lineages",
        sa.Column("reference_dataset_name", sa.String(), nullable=True),
        schema="aspen",
    )
    op.add_column(
        "sample_lineages",
        sa.Column("reference_sequence_accession", sa.String(), nullable=True),
        schema="aspen",
    )
    op.add_column(
        "sample_lineages",
        sa.Column("reference_dataset_tag", sa.String(), nullable=True),
        schema="aspen",
    )
    op.add_column(
        "sample_mutations",
        sa.Column("reference_sequence_accession", sa.String(), nullable=True),
        schema="aspen",
    )
    op.add_column(
        "sample_qc_metrics",
        sa.Column("reference_dataset_name", sa.String(), nullable=True),
        schema="aspen",
    )
    op.add_column(
        "sample_qc_metrics",
        sa.Column("reference_sequence_accession", sa.String(), nullable=True),
        schema="aspen",
    )
    op.add_column(
        "sample_qc_metrics",
        sa.Column("reference_dataset_tag", sa.String(), nullable=True),
        schema="aspen",
    )


def downgrade():
    op.drop_column(
        "sample_qc_metrics", "reference_dataset_tag", schema="aspen"
    )
    op.drop_column(
        "sample_qc_metrics", "reference_sequence_accession", schema="aspen"
    )
    op.drop_column(
        "sample_qc_metrics", "reference_dataset_name", schema="aspen"
    )
    op.drop_column(
        "sample_mutations", "reference_sequence_accession", schema="aspen"
    )
    op.drop_column("sample_lineages", "reference_dataset_tag", schema="aspen")
    op.drop_column(
        "sample_lineages", "reference_sequence_accession", schema="aspen"
    )
    op.drop_column("sample_lineages", "reference_dataset_name", schema="aspen")
