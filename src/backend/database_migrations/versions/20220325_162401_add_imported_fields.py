"""add imported fields

Create Date: 2022-03-25 16:24:04.515171

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220325_162401"
down_revision = "20220215_194838"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "samples",
        sa.Column(
            "imported_at",
            sa.DateTime(),
            nullable=True,
            comment="datetime when sample was created",
        ),
        schema="aspen",
    )
    op.add_column(
        "samples",
        sa.Column(
            "imported_by",
            sa.VARCHAR(),
            nullable=True,
            comment="Source the sample was imported from",
        ),
        schema="aspen",
    )


def downgrade():
    pass
