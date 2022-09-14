"""make tree pathogens required

Create Date: 2022-09-09 23:27:49.587592

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220909_232743"
down_revision = "20220907_225235"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        "users",
        "group_admin",
        existing_type=sa.BOOLEAN(),
        nullable=True,
        schema="aspen",
    )


def downgrade():
    raise NotImplementedError("don't downgrade")
