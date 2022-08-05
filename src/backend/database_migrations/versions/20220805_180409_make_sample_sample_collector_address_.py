"""Make Sample sample_collector_address nullable

Create Date: 2022-08-05 18:04:15.263646

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220805_180409"
down_revision = "20220803_224221"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        "samples",
        "sample_collector_contact_address",
        existing_type=sa.VARCHAR(),
        nullable=True,
        schema="aspen",
    )


def downgrade():
    raise NotImplementedError("Reversing this migration is not supported")