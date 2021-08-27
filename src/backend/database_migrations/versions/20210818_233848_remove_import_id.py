"""remove import id

Create Date: 2021-08-18 23:38:50.040901

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = "20210818_233848"
down_revision = "20210816_180307"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_column(
        "gisaid_metadata",
        "import_id",
        schema="aspen",
    )


def downgrade():
    # Don't downgrade
    pass
