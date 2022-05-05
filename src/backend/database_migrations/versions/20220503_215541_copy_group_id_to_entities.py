"""copy group_id to entities

Create Date: 2022-05-03 21:55:47.093470

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220503_215541"
down_revision = "20220502_215324"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "entities",
        sa.Column("group_id", sa.Integer(), nullable=True),
        schema="aspen",
    )
    op.create_foreign_key(
        op.f("fk_entities_group_id_groups"),
        "entities",
        "groups",
        ["group_id"],
        ["id"],
        source_schema="aspen",
        referent_schema="aspen",
    )
    op.execute(
        """
        UPDATE aspen.entities as e
           SET group_id = (
             SELECT pr.group_id
               FROM aspen.phylo_runs AS pr
              WHERE pr.workflow_id = e.producing_workflow_id
                AND e.entity_type = 'PHYLO_TREE'
           )
    """
    )


def downgrade():
    raise NotImplementedError("don't downgrade")
