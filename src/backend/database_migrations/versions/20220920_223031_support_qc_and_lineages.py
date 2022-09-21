"""support qc and lineages

Create Date: 2022-09-20 22:30:38.379237

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220920_223031"
down_revision = "20220914_205721"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "lineage_types",
        sa.Column("item_id", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("item_id", name=op.f("pk_lineage_types")),
        schema="aspen",
    )
    op.create_table(
        "qc_types",
        sa.Column("item_id", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("item_id", name=op.f("pk_qc_types")),
        schema="aspen",
    )
    op.create_table(
        "sample_lineages",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("sample_id", sa.Integer(), nullable=True),
        sa.Column("lineage_type", enumtables.enum_column.EnumType(), nullable=False),
        sa.Column("lineage_software_version", sa.String(), nullable=False),
        sa.Column("lineage", sa.String(), nullable=False),
        sa.Column("lineage_probability", sa.Float(), nullable=False),
        sa.Column("raw_lineage_output", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(
            ["lineage_type"],
            ["aspen.lineage_types.item_id"],
            name=op.f("fk_sample_lineages_lineage_type_lineage_types"),
        ),
        sa.ForeignKeyConstraint(
            ["sample_id"],
            ["aspen.samples.id"],
            name=op.f("fk_sample_lineages_sample_id_samples"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_sample_lineages")),
        sa.UniqueConstraint(
            "sample_id",
            "lineage_type",
            name=op.f("uq_sample_lineages_sample_id"),
        ),
        schema="aspen",
    )
    op.create_table(
        "sample_qc_metrics",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("sample_id", sa.Integer(), nullable=True),
        sa.Column("qc_type", enumtables.enum_column.EnumType(), nullable=False),
        sa.Column("qc_score", sa.String(), nullable=False),
        sa.Column("qc_software_version", sa.String(), nullable=False),
        sa.Column("qc_status", sa.String(), nullable=False),
        sa.Column("raw_qc_output", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(
            ["qc_type"],
            ["aspen.qc_types.item_id"],
            name=op.f("fk_sample_qc_metrics_qc_type_qc_types"),
        ),
        sa.ForeignKeyConstraint(
            ["sample_id"],
            ["aspen.samples.id"],
            name=op.f("fk_sample_qc_metrics_sample_id_samples"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_sample_qc_metrics")),
        sa.UniqueConstraint("qc_score", name=op.f("uq_sample_qc_metrics_qc_score")),
        sa.UniqueConstraint(
            "sample_id", "qc_type", name=op.f("uq_sample_qc_metrics_sample_id")
        ),
        schema="aspen",
    )
    op.enum_insert("lineage_types", ["PANGOLIN", "NEXTCLADE"], schema="aspen")
    op.enum_insert("qc_types", ["PANGOLIN", "NEXTCLADE"], schema="aspen")


def downgrade():
    raise NotImplementedError("Downgrade not implemented.")
