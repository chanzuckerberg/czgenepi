"""Add tree type column to run and tree

Create Date: 2021-09-01 13:46:00.254183

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20210901_134600"
down_revision = "20210818_233848"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "tree_types",
        sa.Column("item_id", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("item_id", name=op.f("pk_tree_types")),
        schema="aspen",
    )
    op.add_column(
        "phylo_runs",
        sa.Column("tree_type", enumtables.enum_column.EnumType(), nullable=False),
        schema="aspen",
    )
    op.add_column(
        "phylo_trees",
        sa.Column("tree_type", enumtables.enum_column.EnumType(), nullable=False),
        schema="aspen",
    )
    op.create_foreign_key(
        op.f("fk_phylo_runs_tree_type_tree_types"),
        "phylo_runs",
        "tree_types",
        ["tree_type"],
        ["item_id"],
        source_schema="aspen",
        referent_schema="aspen",
    )
    op.create_foreign_key(
        op.f("fk_phylo_trees_tree_type_tree_types"),
        "phylo_trees",
        "tree_types",
        ["tree_type"],
        ["item_id"],
        source_schema="aspen",
        referent_schema="aspen",
    )
    op.enum_insert(
        "tree_types",
        ["OVERVIEW", "TARGETED", "NON_CONTEXTUALIZED"],
        schema="aspen",
    )


def downgrade():
    op.drop_constraint(
        op.f("fk_phylo_runs_tree_type_tree_types"),
        "phylo_runs",
        schema="aspen",
        type_="foreignkey",
    )
    op.drop_constraint(
        op.f("fk_phylo_trees_tree_type_tree_types"),
        "phylo_trees",
        schema="aspen",
        type_="foreignkey",
    )
    op.drop_column("phylo_runs", "tree_type", schema="aspen")
    op.drop_column("phylo_trees", "tree_type", schema="aspen")
    op.drop_table("tree_types", schema="aspen")
