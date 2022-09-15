"""make sample pathogen required

Create Date: 2022-09-14 20:57:27.921683

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220914_205721"
down_revision = "20220909_232743"
branch_labels = None
depends_on = None


def upgrade():
    # backpopulate pathogen fields to sars-cov-2
    op.execute(
        """
        UPDATE aspen.samples
        SET pathogen_id=(
            SELECT id from aspen.pathogens WHERE slug='SC2'
        )
        WHERE pathogen_id IS NULL
        """
    )
    # Make this field not nullable.
    op.alter_column(
        "samples",
        "pathogen_id",
        existing_type=sa.INTEGER(),
        nullable=False,
        schema="aspen",
    )


def downgrade():
    raise NotImplementedError("don't roll back")
