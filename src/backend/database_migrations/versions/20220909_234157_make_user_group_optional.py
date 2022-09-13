"""make user group optional

Create Date: 2022-09-09 23:42:03.305123

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220909_234157"
down_revision = "20220907_225235"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        "users",
        "group_id",
        existing_type=sa.INTEGER(),
        nullable=True,
        schema="aspen",
    )


def downgrade():
    raise NotImplementedError("don't downgrade")
