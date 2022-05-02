"""clean up unused tables

Create Date: 2022-05-02 17:19:09.910095

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "20220502_171903"
down_revision = "20220425_225456"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_table("region_types", schema="aspen")
    op.drop_table("align_read_workflows", schema="aspen")
    op.drop_table("call_consensus_workflows", schema="aspen")
    op.drop_table("sequencing_reads_collections", schema="aspen")
    op.drop_table("sequencing_instrument_types", schema="aspen")
    op.drop_table("filter_read_workflows", schema="aspen")
    op.drop_table("host_filtered_sequencing_reads_collections", schema="aspen")
    op.drop_table("sequencing_protocol_types", schema="aspen")
    op.drop_table("bams", schema="aspen")
    op.drop_table("called_pathogen_genomes", schema="aspen")
    op.enum_delete(
        "entity_types",
        [
            "CALLED_PATHOGEN_GENOME",
            "BAM",
            "SEQUENCING_READS",
            "HOST_FILTERED_SEQUENCE_READS",
        ],
        schema="aspen",
    )
    op.enum_delete(
        "workflow_types",
        ["CALL_CONSENSUS", "ALIGN_READ", "FILTER_READ"],
        schema="aspen",
    )


def downgrade():
    raise NotImplementedError("don't downgrade")
