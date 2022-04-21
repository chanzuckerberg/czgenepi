"""add location latlongs

Create Date: 2022-04-13 22:51:59.577986

"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import DOUBLE_PRECISION

# revision identifiers, used by Alembic.
revision = "20220413_225151"
down_revision = "20220315_205645"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "locations",
        sa.Column("latitude", DOUBLE_PRECISION, nullable=True),
        schema="aspen",
    )
    op.add_column(
        "locations",
        sa.Column("longitude", DOUBLE_PRECISION, nullable=True),
        schema="aspen",
    )


def downgrade():
    pass
