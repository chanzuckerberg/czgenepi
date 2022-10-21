"""drop unused tables

Create Date: 2022-10-21 17:56:08.895818

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20221021_175601"
down_revision = "20221010_201517"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_table("can_see", schema="aspen")
    op.drop_table("data_types", schema="aspen")
    op.drop_constraint(
        "fk_users_group_id_groups", "users", schema="aspen", type_="foreignkey"
    )
    op.drop_column("users", "group_admin", schema="aspen")
    op.drop_column("users", "group_id", schema="aspen")


def downgrade():
    raise NotImplementedError("Downgrade not implemented.")