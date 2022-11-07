"""Add resolved_template_args col, default_tree_location_id NOT NULL

Create Date: 2022-10-25 23:42:02.152731

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "20221025_234200"
down_revision = "20221021_175601"
branch_labels = None
depends_on = None


def upgrade():
    # Verified before creating migration that both Prod and Staging DBs have
    # no NULL values for default_tree_location_id in any group.
    op.alter_column(
        "groups",
        "default_tree_location_id",
        existing_type=sa.INTEGER(),
        nullable=False,
        schema="aspen",
    )
    op.add_column(
        "phylo_trees",
        sa.Column(
            "resolved_template_args",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
        schema="aspen",
    )


def downgrade():
    op.drop_column("phylo_trees", "resolved_template_args", schema="aspen")
    op.alter_column(
        "groups",
        "default_tree_location_id",
        existing_type=sa.INTEGER(),
        nullable=True,
        schema="aspen",
    )
