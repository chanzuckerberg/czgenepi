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
            # We do NOT set a `server_default` on creation, because
            # we want preexisting records to come in as NULL.
            # server_default=sa.text("now()"),
            nullable=True,
        ),
        schema="aspen",
    )

    # Now that column is added and prior records have a NULL created_at
    # we come back and change the default so new records will be set correctly.
    op.alter_column(
        "users",
        "created_at",
        server_default=sa.text("now()"),
        schema="aspen",
    )


def downgrade():
    op.drop_column("users", "created_at", schema="aspen")
