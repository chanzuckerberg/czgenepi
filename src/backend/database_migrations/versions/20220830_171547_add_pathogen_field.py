"""

Create Date: 2022-08-30 17:15:56.013826

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220830_171547"
down_revision = "20220816_000535"
branch_labels = None
depends_on = None


def upgrade():

    op.add_column(
        "pathogen_genomes",
        sa.Column("pathogen_id", sa.Integer()),
        schema="aspen",
    )
    op.create_foreign_key(
        op.f("fk_pathogen_genomes_pathogen_id_pathogens"),
        "pathogen_genomes",
        "pathogens",
        ["pathogen_id"],
        ["id"],
        source_schema="aspen",
        referent_schema="aspen",
    )

    op.add_column(
        "phylo_runs",
        sa.Column("pathogen_id", sa.Integer()),
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
        "samples",
        sa.Column("pathogen_id", sa.Integer()),
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
        UPDATE aspen.pathogen_genomes 
        SET pathogen_id=(
            SELECT id from aspen.pathogens WHERE name='SARS-CoV-2'
        )
        """
    )


def downgrade():
    raise NotImplementedError("downgrading the DB is not allowed")
