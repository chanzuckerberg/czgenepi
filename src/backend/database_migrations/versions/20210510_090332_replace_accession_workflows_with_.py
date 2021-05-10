"""replace accession workflows with repository-specific workflows

Create Date: 2021-05-10 09:03:34.650989

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20210510_090332"
down_revision = "20210508_000129"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "genbank_accession_workflows",
        sa.Column("workflow_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["workflow_id"],
            ["aspen.workflows.id"],
            name=op.f("fk_genbank_accession_workflows_workflow_id_workflows"),
        ),
        sa.PrimaryKeyConstraint(
            "workflow_id", name=op.f("pk_genbank_accession_workflows")
        ),
        schema="aspen",
    )
    op.create_table(
        "gisaid_accession_workflows",
        sa.Column("workflow_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["workflow_id"],
            ["aspen.workflows.id"],
            name=op.f("fk_gisaid_accession_workflows_workflow_id_workflows"),
        ),
        sa.PrimaryKeyConstraint(
            "workflow_id", name=op.f("pk_gisaid_accession_workflows")
        ),
        schema="aspen",
    )
    op.create_table(
        "genbank_accessions",
        sa.Column("entity_id", sa.Integer(), nullable=False),
        sa.Column("public_identifier", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["entity_id"],
            ["aspen.entities.id"],
            name=op.f("fk_genbank_accessions_entity_id_entities"),
        ),
        sa.PrimaryKeyConstraint("entity_id", name=op.f("pk_genbank_accessions")),
        sa.UniqueConstraint(
            "public_identifier",
            name=op.f("uq_genbank_accessions_public_identifier"),
        ),
        schema="aspen",
    )
    op.create_table(
        "gisaid_accessions",
        sa.Column("entity_id", sa.Integer(), nullable=False),
        sa.Column("public_identifier", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["entity_id"],
            ["aspen.entities.id"],
            name=op.f("fk_gisaid_accessions_entity_id_entities"),
        ),
        sa.PrimaryKeyConstraint("entity_id", name=op.f("pk_gisaid_accessions")),
        sa.UniqueConstraint(
            "public_identifier",
            name=op.f("uq_gisaid_accessions_public_identifier"),
        ),
        schema="aspen",
    )
    op.drop_table("accessions", schema="aspen")
    op.drop_table("accession_workflows", schema="aspen")
    op.drop_table("public_repository_types", schema="aspen")
    op.execute(
        """
        DELETE FROM aspen.workflows WHERE workflow_type='PUBLIC_REPOSITORY_SUBMISSION'
        """
    )
    op.execute(
        """
        DELETE FROM aspen.entities WHERE entity_type='PUBLIC_REPOSITORY_SUBMISSION'
        """
    )
    op.enum_insert(
        "entity_types",
        ["GISAID_REPOSITORY_SUBMISSION", "GENBANK_REPOSITORY_SUBMISSION"],
        schema="aspen",
    )
    op.enum_delete("entity_types", ["PUBLIC_REPOSITORY_SUBMISSION"], schema="aspen")
    op.enum_insert(
        "workflow_types",
        ["GISAID_REPOSITORY_SUBMISSION", "GENBANK_REPOSITORY_SUBMISSION"],
        schema="aspen",
    )
    op.enum_delete("workflow_types", ["PUBLIC_REPOSITORY_SUBMISSION"], schema="aspen")


def downgrade():
    raise NotImplementedError("Downgrading the database is not allowed")
