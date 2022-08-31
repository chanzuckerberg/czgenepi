"""

Create Date: 2022-08-31 15:05:41.687295

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220831_150533"
down_revision = "20220816_000535"
branch_labels = None
depends_on = None


def upgrade():

    # sync SA models with DB (small changes to add comments)
    op.alter_column(
        "pathogen_repo_configs",
        "prefix",
        existing_type=sa.VARCHAR(),
        comment="identifier samples prefix, ex: hCoV-19",
        existing_nullable=False,
        schema="aspen",
    )
    op.alter_column(
        "pathogens",
        "slug",
        existing_type=sa.VARCHAR(),
        comment="Used as a URL param for differentiating functionality within CZGE, ex: SC2",
        existing_nullable=False,
        schema="aspen",
    )
    op.alter_column(
        "pathogens",
        "name",
        existing_type=sa.VARCHAR(),
        comment="full pathogen abbreviated name, ex: SARS-CoV-2",
        existing_nullable=False,
        schema="aspen",
    )
    op.alter_column(
        "public_repositories",
        "name",
        existing_type=sa.VARCHAR(),
        comment="Public Repository abbreviated name (ex: GISAID/GenBank)",
        existing_nullable=False,
        schema="aspen",
    )

    # add new foreign key relationships:
    op.add_column(
        "phylo_runs",
        sa.Column("pathogen_id", sa.Integer(), nullable=True),
        schema="aspen",
    )
    op.create_foreign_key(
        op.f("fk_phylo_runs_pathogen_id_pathogens"),
        "phylo_runs",
        "pathogens",
        ["pathogen_id"],
        ["id"],
        source_schema="aspen",
        referent_schema="aspen",
    )
    op.add_column(
        "phylo_trees",
        sa.Column("pathogen_id", sa.Integer(), nullable=True),
        schema="aspen",
    )
    op.create_foreign_key(
        op.f("fk_phylo_trees_pathogen_id_pathogens"),
        "phylo_trees",
        "pathogens",
        ["pathogen_id"],
        ["id"],
        source_schema="aspen",
        referent_schema="aspen",
    )

    op.add_column(
        "samples",
        sa.Column("pathogen_id", sa.Integer(), nullable=True),
        schema="aspen",
    )
    op.create_foreign_key(
        op.f("fk_samples_pathogen_id_pathogens"),
        "samples",
        "pathogens",
        ["pathogen_id"],
        ["id"],
        source_schema="aspen",
        referent_schema="aspen",
    )

    # backpopulate pathogen fields to sars-cov-2
    op.execute(
        """
        UPDATE aspen.samples
        SET pathogen_id=(
            SELECT id from aspen.pathogens WHERE name='SARS-CoV-2'
        )
        """
    )
    op.execute(
        """
        UPDATE aspen.phylo_runs
        SET pathogen_id=(
            SELECT id from aspen.pathogens WHERE name='SARS-CoV-2'
        )
        """
    )
    op.execute(
        """
        UPDATE aspen.phylo_trees
        SET pathogen_id=(
            SELECT id from aspen.pathogens WHERE name='SARS-CoV-2'
        )
        """
    )


def downgrade():
    raise NotImplementedError("Downgrading the DB is not allowed")
