"""enable earthdistance extensions

Create Date: 2022-04-15 18:36:09.034892

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220415_183602"
down_revision = "20220413_225151"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    enable_cube = sa.sql.text("create extension if not exists cube")
    conn.execute(enable_cube)
    enable_earthdistance = sa.sql.text("create extension if not exists earthdistance")
    conn.execute(enable_earthdistance)


def downgrade():
    pass
