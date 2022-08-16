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
        sa.Column("slug", sa.String(), nullable=False)
        sa.Column("name", sa.String(), nullable=False),
        schema="aspen",
    )

    op.create_table(
        "public_repositories",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        schema="aspen",
    )

    op.create_table(
        "pathogen_prefixes",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("prefix", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["public_repository_id"],
            ["aspen.public_repository.id"],
            name=op.f("fk_pathogen_prefixes_public_repository_id_public_repositories"),
        ),
        sa.ForeignKeyConstraint(
            ["pathogen_id"],
            ["aspen.pathogen.id"],
            name=op.f("fk_pathogen_prefixes_pathogen_id_pathogens"),
        ),
        schema="aspen",
    )

    op.execute("INSERT INTO table pathogens (id, slug, name) VALUES (1, 'SC2', 'SARS-CoV-2')")

    op.execute("""
        INSERT INTO public_repositories (id, name) VALUES
             ( 1, 'GISAID' ),
             ( 2, 'GenBank' )
    """)

    op.execute("""
        INSERT INTO pathogen_prefixes (id, prefix, public_repository_id, pathogen_id) VALUES
             ( 1, 'hCoV-19', (SELECT id from public_repositories WHERE name='GISAID'), (SELECT id from pathogens WHERE name='SARS-CoV-2') ),
             ( 2, 'SARS-CoV-2/human', (SELECT id from public_repositories WHERE name='GenBank'), (SELECT id from pathogens WHERE name='SARS-CoV-2') )
    """)


def downgrade():
    raise NotImplementedError("Downgrading the DB is not allowed")
