"""Create name field on phylo_runs table; previous was phylo_trees

Create Date: 2021-08-03 11:20:19.953393

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20210803_112019"
down_revision = "20210728_164537"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "phylo_runs",
        sa.Column("name", sa.String(), nullable=True),
        schema="aspen",
    )


def downgrade():
    op.drop_column("phylo_runs", "name", schema="aspen")