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
    op.enum_insert(
        "tree_types",
        ["OVERVIEW", "TARGETED", "NON_CONTEXTUALIZED", "UNKNOWN"],
        schema="aspen",
    )
    op.add_column(
        "phylo_runs",
        sa.Column(
            "tree_type",
            enumtables.enum_column.EnumType(),
            nullable=False,
            server_default="UNKNOWN",
        ),
        schema="aspen",
    )
    op.add_column(
        "phylo_trees",
        sa.Column(
            "tree_type",
            enumtables.enum_column.EnumType(),
            nullable=False,
            server_default="UNKNOWN",
        ),
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

    # update the trees
    ancestors_to_overview_sql = sa.sql.text(
        "UPDATE aspen.phylo_trees SET tree_type = 'OVERVIEW' WHERE phylo_trees.s3_key LIKE '%_ancestors_%' OR phylo_trees.s3_key LIKE '% Contextual.json%'"
    )
    local_to_non_contextualized_sql = sa.sql.text(
        "UPDATE aspen.phylo_trees SET tree_type = 'NON_CONTEXTUALIZED' WHERE phylo_trees.s3_key LIKE '%_local_%' OR phylo_trees.s3_key LIKE '% Local.json%'"
    )
    conn = op.get_bind()
    conn.execute(ancestors_to_overview_sql)
    conn.execute(local_to_non_contextualized_sql)

    # update the runs with phylo trees
    copy_tree_tree_type_to_run_sql = sa.sql.text(
        "UPDATE aspen.phylo_runs SET tree_type = subquery.tree_type FROM (SELECT producing_workflow_id, tree_type FROM aspen.entities INNER JOIN aspen.phylo_trees ON entities.id = phylo_trees.entity_id) AS subquery WHERE phylo_runs.workflow_id = subquery.producing_workflow_id"
    )
    # update remaining runs without phylo trees but with some information on tree type
    assign_overview_to_group_plus_context_sql = sa.sql.text(
        "UPDATE aspen.phylo_runs SET tree_type = 'OVERVIEW' WHERE phylo_runs.tree_type = 'UNKNOWN' AND (phylo_runs.template_file_path LIKE '%group_plus_context.yaml%');"
    )
    assign_non_contextualized_to_group_sql = sa.sql.text(
        "UPDATE aspen.phylo_runs SET tree_type = 'NON_CONTEXTUALIZED' WHERE phylo_runs.tree_type = 'UNKNOWN' AND (phylo_runs.template_file_path LIKE '%group.yaml%');"
    )
    conn.execute(copy_tree_tree_type_to_run_sql)
    conn.execute(assign_overview_to_group_plus_context_sql)
    conn.execute(assign_non_contextualized_to_group_sql)


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
