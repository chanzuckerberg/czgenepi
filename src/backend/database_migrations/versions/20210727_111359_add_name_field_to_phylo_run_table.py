"""Add name field to phylo run table

Create Date: 2021-07-27 11:13:59.925534

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

revision = "20210727_111359"
down_revision = "20210617_201052"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "phylo_trees",
        sa.Column("name", sa.String(), nullable=True),
        schema="aspen",
    )


def downgrade():
    op.drop_column("phylo_trees", "name", schema="aspen")
