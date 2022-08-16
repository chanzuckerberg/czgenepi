"""

Create Date: 2022-08-16 00:05:41.723953, adding pathogen and public repositores table support

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220816_000535"
down_revision = "20220809_234732"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "pathogens",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.UniqueConstraint("slug", name=op.f("uq_pathogens_slug")),
        sa.UniqueConstraint("name", name=op.f("uq_pathogens_name")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_pathogens")),
        schema="aspen",
    )

    op.create_table(
        "public_repositories",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.UniqueConstraint("name", name=op.f("uq_public_repositories_name")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_public_repositories")),
        schema="aspen",
    )

    op.create_table(
        "pathogen_repo_configs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("prefix", sa.String(), nullable=False),
        sa.Column("public_repository_id", sa.Integer(), nullable=False),
        sa.Column("pathogen_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["public_repository_id"],
            ["aspen.public_repositories.id"],
            name=op.f(
                "fk_pathogen_repo_configs_public_repository_id_public_repositories"
            ),
        ),
        sa.ForeignKeyConstraint(
            ["pathogen_id"],
            ["aspen.pathogens.id"],
            name=op.f("fk_pathogen_repo_configs_pathogen_id_pathogens"),
        ),
        sa.UniqueConstraint(
            "public_repository_id",
            "pathogen_id",
            name=op.f("uq_pathogen_repo_configs_public_repository_id_pathogen_id"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_pathogen_repo_configs")),
        schema="aspen",
    )

    op.execute(
        "INSERT INTO aspen.pathogens (id, slug, name) VALUES (1, 'SC2', 'SARS-CoV-2')"
    )

    op.execute(
        """
        INSERT INTO aspen.public_repositories (id, name) VALUES
             ( 1, 'GISAID' ),
             ( 2, 'GenBank' )
    """
    )

    op.execute(
        """
        INSERT INTO aspen.pathogen_repo_configs (id, prefix, public_repository_id, pathogen_id) VALUES
             ( 1, 'hCoV-19', (SELECT id from aspen.public_repositories WHERE name='GISAID'), (SELECT id from aspen.pathogens WHERE name='SARS-CoV-2') ),
             ( 2, 'SARS-CoV-2/human', (SELECT id from aspen.public_repositories WHERE name='GenBank'), (SELECT id from aspen.pathogens WHERE name='SARS-CoV-2') )
    """
    )


def downgrade():
    raise NotImplementedError("Downgrading the DB is not allowed")
