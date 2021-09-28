"""Add users column of acknowledged_policy_version

Create Date: 2021-09-28 20:37:51.381909

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20210928_203749"
down_revision = "20210901_134600"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "users",
        # Avoiding use of `server_default` to keep default-ing control in backend code
        # so, if later desired, we could choose to set the value during user creation.
        sa.Column("acknowledged_policy_version", sa.Date(), nullable=True),
        schema="aspen",
    )
    # Existing users will all have new column set to NULL, which is desired.


def downgrade():
    op.drop_column("users", "acknowledged_policy_version", schema="aspen")
