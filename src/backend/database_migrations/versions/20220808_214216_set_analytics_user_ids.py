"""set analytics user ids

Create Date: 2022-08-08 21:42:17.801419

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220808_214216"
down_revision = "20220805_180409"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "users",
        # Column is NOT actually nullable
        # Just need it to be nullable for creation through initial data setup
        sa.Column("analytics_id", sa.String(), nullable=True),
        schema="aspen",
    )
    op.create_unique_constraint(
        op.f("uq_users_analytics_id"),
        "users",
        ["analytics_id"],
        schema="aspen",
    )
    # Below is SQL implementation of models.usergroup.generate_random_id
    op.execute(
        """
        UPDATE aspen.users set analytics_id = array_to_string(array(
          select substr('abcdefghijklmnopqrstuvwxyz0123456789',((random()*(36-1)+1)::integer),1) from generate_series(1,20) where users.id = users.id
        ),'');
    """
    )
    # Now that data is loaded, can properly set column to nullable=False
    op.alter_column(
        "users",
        "analytics_id",
        nullable=False,
        schema="aspen",
    )


def downgrade():
    raise NotImplementedError("don't downgrade")
