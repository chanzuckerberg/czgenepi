"""Drop old accession workflows

Create Date: 2022-01-21 11:21:43.453138

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220121_112143"
down_revision = "20220119_153132"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    op.drop_table("genbank_accession_workflows", schema="aspen")
    op.drop_table("genbank_accessions", schema="aspen")
    op.drop_table("gisaid_accession_workflows", schema="aspen")
    op.drop_table("gisaid_accessions", schema="aspen")
    op.drop_table("gisaid_workflows", schema="aspen")

    drop_gisaid_entities_sql = sa.sql.text(
        "DELETE FROM aspen.entities WHERE entity_type IN ('GISAID_REPOSITORY_SUBMISSION', 'GENBANK_REPOSITORY_SUBMISSION')"
    )
    conn.execute(drop_gisaid_entities_sql)

    drop_gisaid_workflow_inputs_sql = sa.sql.text(
        "DELETE FROM aspen.workflow_inputs WHERE workflow_id IN (SELECT id FROM aspen.workflows WHERE workflow_type IN ('GISAID_REPOSITORY_SUBMISSION', 'GENBANK_REPOSITORY_SUBMISSION'))"
    )
    conn.execute(drop_gisaid_workflow_inputs_sql)

    drop_gisaid_workflows_sql = sa.sql.text(
        "DELETE FROM aspen.workflows WHERE workflow_type IN ('GISAID_REPOSITORY_SUBMISSION', 'GENBANK_REPOSITORY_SUBMISSION')"
    )
    conn.execute(drop_gisaid_workflows_sql)

    op.enum_delete(
        "workflow_types",
        ["GISAID_REPOSITORY_SUBMISSION", "GENBANK_REPOSITORY_SUBMISSION"],
        schema="aspen",
    )

    op.enum_delete(
        "entity_types",
        ["GISAID_REPOSITORY_SUBMISSION", "GENBANK_REPOSITORY_SUBMISSION"],
        schema="aspen",
    )


def downgrade():
    pass
