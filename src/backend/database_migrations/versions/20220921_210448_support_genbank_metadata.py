"""support genbank metadata

Create Date: 2022-09-21 21:04:50.339237

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220921_210448"
down_revision = "20220920_223031"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "public_repo_metadata",
        sa.Column("strain", sa.String(), nullable=False),
        sa.Column("public_repository_id", sa.Integer(), nullable=False),
        sa.Column("pathogen_id", sa.Integer(), nullable=False),
        sa.Column("lineage", sa.String(), nullable=True),
        sa.Column("clade", sa.String(), nullable=True),
        sa.Column("epi_isl", sa.String(), nullable=True),
        sa.Column("date", sa.DateTime(), nullable=True),
        sa.Column("region", sa.String(), nullable=True),
        sa.Column("country", sa.String(), nullable=True),
        sa.Column("division", sa.String(), nullable=True),
        sa.Column("location", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(
            ["pathogen_id"],
            ["aspen.pathogens.id"],
            name=op.f("fk_public_repo_metadata_pathogen_id_pathogens"),
        ),
        sa.ForeignKeyConstraint(
            ["public_repository_id"],
            ["aspen.public_repositories.id"],
            name=op.f(
                "fk_public_repo_metadata_public_repository_id_public_repositories"
            ),
        ),
        sa.PrimaryKeyConstraint("strain", name=op.f("pk_public_repo_metadata")),
        schema="aspen",
    )


def downgrade():
    raise NotImplementedError("Downgrade not supported.")
