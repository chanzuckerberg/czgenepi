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

    drop_gisaid_workflows_sql = sa.sql.text(
        "DELETE FROM workflows WHERE workflow_type = 'GISAID_REPOSITORY_SUBMISSION'"
    )
    conn.execute(drop_gisaid_workflows_sql)

    drop_genbank_workflows_sql = sa.sql.text(
        "DELETE FROM workflows WHERE workflow_type = 'GENBANK_REPOSITORY_SUBMISSION'"
    )
    conn.execute(drop_genbank_workflows_sql)

    drop_gisaid_entities_sql = sa.sql.text(
        "DELETE FROM entities WHERE entity_type = 'GISAID_REPOSITORY_SUBMISSION'"
    )
    conn.execute(drop_gisaid_entities_sql)

    drop_genbank_entities_sql = sa.sql.text(
        "DELETE FROM entities WHERE entity_type = 'GENBANK_REPOSITORY_SUBMISSION'"
    )
    conn.execute(drop_genbank_entities_sql)

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
