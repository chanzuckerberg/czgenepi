"""Enum tables for QC and Mutations

Create Date: 2022-11-22 06:43:53.096679

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20221122_064351"
down_revision = "20221117_003051"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "mutations_callers",
        sa.Column("item_id", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("item_id", name=op.f("pk_mutations_callers")),
        schema="aspen",
    )
    op.create_table(
        "qc_metric_callers",
        sa.Column("item_id", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("item_id", name=op.f("pk_qc_metric_callers")),
        schema="aspen",
    )
    op.add_column(
        "sample_mutations",
        sa.Column(
            "mutations_caller",
            enumtables.enum_column.EnumType(),
            nullable=False,
        ),
        schema="aspen",
    )
    op.create_unique_constraint(
        op.f("uq_sample_mutations_sample_id_mutations_caller"),
        "sample_mutations",
        ["sample_id", "mutations_caller"],
        schema="aspen",
    )
    op.create_foreign_key(
        op.f("fk_sample_mutations_mutations_caller_mutations_callers"),
        "sample_mutations",
        "mutations_callers",
        ["mutations_caller"],
        ["item_id"],
        source_schema="aspen",
        referent_schema="aspen",
    )
    op.add_column(
        "sample_qc_metrics",
        sa.Column("qc_caller", enumtables.enum_column.EnumType(), nullable=False),
        schema="aspen",
    )
    op.create_unique_constraint(
        op.f("uq_sample_qc_metrics_sample_id_qc_caller"),
        "sample_qc_metrics",
        ["sample_id", "qc_caller"],
        schema="aspen",
    )
    op.create_foreign_key(
        op.f("fk_sample_qc_metrics_qc_caller_qc_metric_callers"),
        "sample_qc_metrics",
        "qc_metric_callers",
        ["qc_caller"],
        ["item_id"],
        source_schema="aspen",
        referent_schema="aspen",
    )
    op.enum_insert("qc_metric_callers", ["NEXTCLADE"], schema="aspen")
    op.enum_insert("mutations_callers", ["NEXTCLADE"], schema="aspen")


def downgrade():
    op.enum_delete("mutations_callers", ["NEXTCLADE"], schema="aspen")
    op.enum_delete("qc_metric_callers", ["NEXTCLADE"], schema="aspen")
    op.drop_constraint(
        op.f("fk_sample_qc_metrics_qc_caller_qc_metric_callers"),
        "sample_qc_metrics",
        schema="aspen",
        type_="foreignkey",
    )
    op.drop_constraint(
        op.f("uq_sample_qc_metrics_sample_id_qc_caller"),
        "sample_qc_metrics",
        schema="aspen",
        type_="unique",
    )
    op.drop_column("sample_qc_metrics", "qc_caller", schema="aspen")
    op.drop_constraint(
        op.f("fk_sample_mutations_mutations_caller_mutations_callers"),
        "sample_mutations",
        schema="aspen",
        type_="foreignkey",
    )
    op.drop_constraint(
        op.f("uq_sample_mutations_sample_id_mutations_caller"),
        "sample_mutations",
        schema="aspen",
        type_="unique",
    )
    op.drop_column("sample_mutations", "mutations_caller", schema="aspen")
    op.drop_table("qc_metric_callers", schema="aspen")
    op.drop_table("mutations_callers", schema="aspen")
