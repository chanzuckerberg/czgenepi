"""Enable fuzzystrmatch extension

Create Date: 2022-06-15 20:16:25.397423

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220615_201620"
down_revision = "20220524_174911"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    enable_fuzzystrmatch = sa.sql.text(
        "CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public"
    )
    conn.execute(enable_fuzzystrmatch)


def downgrade():
    pass
