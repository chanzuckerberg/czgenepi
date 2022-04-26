"""Move earthdistance and cube extensions to public

Create Date: 2022-04-19 11:01:51.154767

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220419_110151"
down_revision = "20220415_183602"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    disable_earthdistance = sa.sql.text("DROP EXTENSION IF EXISTS earthdistance")
    conn.execute(disable_earthdistance)
    disable_cube = sa.sql.text("DROP EXTENSION IF EXISTS cube")
    conn.execute(disable_cube)

    enable_cube = sa.sql.text("CREATE EXTENSION IF NOT EXISTS cube WITH SCHEMA public")
    conn.execute(enable_cube)
    enable_earthdistance = sa.sql.text(
        "CREATE EXTENSION IF NOT EXISTS earthdistance WITH SCHEMA public"
    )
    conn.execute(enable_earthdistance)


def downgrade():
    pass
