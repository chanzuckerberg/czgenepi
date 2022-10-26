"""fix constraint names

Create Date: 2022-10-21 20:54:14.891508

"""
import enumtables  # noqa: F401
from alembic import op

# revision identifiers, used by Alembic.
revision = "20221021_205409"
down_revision = "20221025_234200"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_constraint(
        "uq_phylo_trees_s3_bucket",
        "phylo_trees",
        schema="aspen",
        type_="unique",
    )
    op.create_unique_constraint(
        op.f("uq_phylo_trees_s3_bucket_s3_key"),
        "phylo_trees",
        ["s3_bucket", "s3_key"],
        schema="aspen",
    )
    op.drop_constraint(
        "uq_raw_gisaid_dump_s3_bucket",
        "raw_gisaid_dump",
        schema="aspen",
        type_="unique",
    )
    op.create_unique_constraint(
        op.f("uq_raw_gisaid_dump_s3_bucket_s3_key"),
        "raw_gisaid_dump",
        ["s3_bucket", "s3_key"],
        schema="aspen",
    )
    op.drop_constraint(
        "uq_sample_lineages_sample_id",
        "sample_lineages",
        schema="aspen",
        type_="unique",
    )
    op.create_unique_constraint(
        op.f("uq_sample_lineages_sample_id_lineage_type"),
        "sample_lineages",
        ["sample_id", "lineage_type"],
        schema="aspen",
    )
    op.drop_constraint(
        "uq_samples_submitting_group_id",
        "samples",
        schema="aspen",
        type_="unique",
    )
    op.create_unique_constraint(
        op.f("uq_samples_submitting_group_id_private_identifier"),
        "samples",
        ["submitting_group_id", "private_identifier"],
        schema="aspen",
    )


def downgrade():
    raise NotImplementedError("Downgrade not implemented.")
