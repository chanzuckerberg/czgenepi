"""add pathogens to all trees

Create Date: 2022-09-07 22:52:41.089769

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220907_225235"
down_revision = "20220907_220840"
branch_labels = None
depends_on = None


def upgrade():
    # backpopulate pathogen fields to sars-cov-2
    op.execute(
        """
        UPDATE aspen.phylo_runs
        SET pathogen_id=(
            SELECT id from aspen.pathogens WHERE slug='SC2'
        )
        WHERE pathogen_id IS NULL
        """
    )
    op.execute(
        """
        UPDATE aspen.phylo_trees
        SET pathogen_id=(
            SELECT id from aspen.pathogens WHERE slug='SC2'
        )
        WHERE pathogen_id IS NULL
        """
    )
    op.alter_column(
        "phylo_runs",
        "pathogen_id",
        existing_type=sa.INTEGER(),
        nullable=False,
        schema="aspen",
    )
    op.alter_column(
        "phylo_trees",
        "pathogen_id",
        existing_type=sa.INTEGER(),
        nullable=False,
        schema="aspen",
    )


def downgrade():
    raise NotImplementedError("don't downgrade")
