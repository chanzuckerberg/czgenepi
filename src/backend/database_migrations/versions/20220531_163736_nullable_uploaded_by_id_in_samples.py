"""nullable uploaded_by_id in samples

Create Date: 2022-05-31 16:37:42.491598

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220531_163736"
down_revision = "20220524_174911"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column("samples", "uploaded_by_id", nullable=True, schema="aspen")


def downgrade():
    pass
