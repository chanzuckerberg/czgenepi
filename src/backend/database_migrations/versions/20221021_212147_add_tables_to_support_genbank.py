"""add tables to support genbank

Create Date: 2022-10-21 21:21:53.589840

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20221021_212147"
down_revision = "20221021_205409"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "pathogen_lineages",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("pathogen_id", sa.Integer(), nullable=False),
        sa.Column("lineage", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["pathogen_id"],
            ["aspen.pathogens.id"],
            name=op.f("fk_pathogen_lineages_pathogen_id_pathogens"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_pathogen_lineages")),
        sa.UniqueConstraint(
            "pathogen_id",
            "lineage",
            name=op.f("uq_pathogen_lineages_pathogen_id_lineage"),
        ),
        schema="aspen",
    )
    op.create_table(
        "public_repository_metadata",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("pathogen_id", sa.Integer(), nullable=False),
        sa.Column("public_repository_id", sa.Integer(), nullable=False),
        sa.Column("strain", sa.String(), nullable=False),
        sa.Column("lineage", sa.String(), nullable=True),
        sa.Column("isl", sa.String(), nullable=True),
        sa.Column("date", sa.DateTime(), nullable=True),
        sa.Column("region", sa.String(), nullable=True),
        sa.Column("country", sa.String(), nullable=True),
        sa.Column("division", sa.String(), nullable=True),
        sa.Column("location", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(
            ["pathogen_id"],
            ["aspen.pathogens.id"],
            name=op.f("fk_public_repository_metadata_pathogen_id_pathogens"),
        ),
        sa.ForeignKeyConstraint(
            ["public_repository_id"],
            ["aspen.public_repositories.id"],
            name=op.f(
                "fk_public_repository_metadata_public_repository_id_public_repositories"
            ),
        ),
        sa.PrimaryKeyConstraint(
            "id", "strain", name=op.f("pk_public_repository_metadata")
        ),
        sa.UniqueConstraint(
            "pathogen_id",
            "public_repository_id",
            "strain",
            name=op.f(
                "uq_public_repository_metadata_pathogen_id_public_repository_id_strain"
            ),
        ),
        schema="aspen",
    )
    op.create_table(
        "repository_alignment_workflows",
        sa.Column("workflow_id", sa.Integer(), nullable=False),
        sa.Column("pathogen_id", sa.Integer(), nullable=False),
        sa.Column("public_repository_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["pathogen_id"],
            ["aspen.pathogens.id"],
            name=op.f("fk_repository_alignment_workflows_pathogen_id_pathogens"),
        ),
        sa.ForeignKeyConstraint(
            ["public_repository_id"],
            ["aspen.public_repositories.id"],
            name=op.f(
                "fk_repository_alignment_workflows_public_repository_id_public_repositories"
            ),
        ),
        sa.ForeignKeyConstraint(
            ["workflow_id"],
            ["aspen.workflows.id"],
            name=op.f("fk_repository_alignment_workflows_workflow_id_workflows"),
        ),
        sa.PrimaryKeyConstraint(
            "workflow_id", name=op.f("pk_repository_alignment_workflows")
        ),
        schema="aspen",
    )
    op.create_table(
        "repository_download_workflows",
        sa.Column("workflow_id", sa.Integer(), nullable=False),
        sa.Column("pathogen_id", sa.Integer(), nullable=False),
        sa.Column("public_repository_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["pathogen_id"],
            ["aspen.pathogens.id"],
            name=op.f("fk_repository_download_workflows_pathogen_id_pathogens"),
        ),
        sa.ForeignKeyConstraint(
            ["public_repository_id"],
            ["aspen.public_repositories.id"],
            name=op.f(
                "fk_repository_download_workflows_public_repository_id_public_repositories"
            ),
        ),
        sa.ForeignKeyConstraint(
            ["workflow_id"],
            ["aspen.workflows.id"],
            name=op.f("fk_repository_download_workflows_workflow_id_workflows"),
        ),
        sa.PrimaryKeyConstraint(
            "workflow_id", name=op.f("pk_repository_download_workflows")
        ),
        schema="aspen",
    )
    op.create_table(
        "aligned_repository_data",
        sa.Column("entity_id", sa.Integer(), nullable=False),
        sa.Column("pathogen_id", sa.Integer(), nullable=False),
        sa.Column("public_repository_id", sa.Integer(), nullable=False),
        sa.Column("s3_bucket", sa.String(), nullable=False),
        sa.Column("sequences_s3_key", sa.String(), nullable=False),
        sa.Column("metadata_s3_key", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["entity_id"],
            ["aspen.entities.id"],
            name=op.f("fk_aligned_repository_data_entity_id_entities"),
        ),
        sa.ForeignKeyConstraint(
            ["pathogen_id"],
            ["aspen.pathogens.id"],
            name=op.f("fk_aligned_repository_data_pathogen_id_pathogens"),
        ),
        sa.ForeignKeyConstraint(
            ["public_repository_id"],
            ["aspen.public_repositories.id"],
            name=op.f(
                "fk_aligned_repository_data_public_repository_id_public_repositories"
            ),
        ),
        sa.PrimaryKeyConstraint("entity_id", name=op.f("pk_aligned_repository_data")),
        sa.UniqueConstraint(
            "s3_bucket",
            "metadata_s3_key",
            name=op.f("uq_aligned_repository_data_s3_bucket_metadata_s3_key"),
        ),
        sa.UniqueConstraint(
            "s3_bucket",
            "sequences_s3_key",
            name=op.f("uq_aligned_repository_data_s3_bucket_sequences_s3_key"),
        ),
        schema="aspen",
    )
    op.create_table(
        "processed_repository_data",
        sa.Column("entity_id", sa.Integer(), nullable=False),
        sa.Column("pathogen_id", sa.Integer(), nullable=False),
        sa.Column("public_repository_id", sa.Integer(), nullable=False),
        sa.Column("s3_bucket", sa.String(), nullable=False),
        sa.Column("sequences_s3_key", sa.String(), nullable=False),
        sa.Column("metadata_s3_key", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["entity_id"],
            ["aspen.entities.id"],
            name=op.f("fk_processed_repository_data_entity_id_entities"),
        ),
        sa.ForeignKeyConstraint(
            ["pathogen_id"],
            ["aspen.pathogens.id"],
            name=op.f("fk_processed_repository_data_pathogen_id_pathogens"),
        ),
        sa.ForeignKeyConstraint(
            ["public_repository_id"],
            ["aspen.public_repositories.id"],
            name=op.f(
                "fk_processed_repository_data_public_repository_id_public_repositories"
            ),
        ),
        sa.PrimaryKeyConstraint("entity_id", name=op.f("pk_processed_repository_data")),
        sa.UniqueConstraint(
            "s3_bucket",
            "metadata_s3_key",
            name=op.f("uq_processed_repository_data_s3_bucket_metadata_s3_key"),
        ),
        sa.UniqueConstraint(
            "s3_bucket",
            "sequences_s3_key",
            name=op.f("uq_processed_repository_data_s3_bucket_sequences_s3_key"),
        ),
        schema="aspen",
    )
    op.create_table(
        "raw_repository_data",
        sa.Column("entity_id", sa.Integer(), nullable=False),
        sa.Column("pathogen_id", sa.Integer(), nullable=False),
        sa.Column("public_repository_id", sa.Integer(), nullable=False),
        sa.Column("download_date", sa.DateTime(), nullable=False),
        sa.Column("s3_bucket", sa.String(), nullable=False),
        sa.Column("s3_key", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["entity_id"],
            ["aspen.entities.id"],
            name=op.f("fk_raw_repository_data_entity_id_entities"),
        ),
        sa.ForeignKeyConstraint(
            ["pathogen_id"],
            ["aspen.pathogens.id"],
            name=op.f("fk_raw_repository_data_pathogen_id_pathogens"),
        ),
        sa.ForeignKeyConstraint(
            ["public_repository_id"],
            ["aspen.public_repositories.id"],
            name=op.f(
                "fk_raw_repository_data_public_repository_id_public_repositories"
            ),
        ),
        sa.PrimaryKeyConstraint("entity_id", name=op.f("pk_raw_repository_data")),
        sa.UniqueConstraint(
            "s3_bucket",
            "s3_key",
            name=op.f("uq_raw_repository_data_s3_bucket_s3_key"),
        ),
        schema="aspen",
    )
    op.enum_insert(
        "entity_types",
        [
            "PROCESSED_PUBLIC_REPOSITORY_DATA",
            "ALIGNED_PUBLIC_REPOSITORY_DATA",
            "RAW_PUBLIC_REPOSITORY_DATA",
        ],
        schema="aspen",
    )
    op.enum_insert(
        "workflow_types",
        ["ALIGN_PUBLIC_REPOSITORY_DATA", "DOWNLOAD_PUBLIC_REPOSITORY_DATA"],
        schema="aspen",
    )


def downgrade():
    raise NotImplementedError("Downgrade not supported.")
