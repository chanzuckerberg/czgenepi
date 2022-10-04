"""Add created_at for users

Create Date: 2022-10-04 22:17:43.014644

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20221004_221741"
down_revision = "20220920_223031"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "users",
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        schema="aspen",
    )


def downgrade():
    op.drop_column("users", "created_at", schema="aspen")
