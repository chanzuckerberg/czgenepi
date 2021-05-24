"""add private to samples

Create Date: 2021-05-24 23:32:30.184292

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "20210524_233229"
down_revision = "20210510_090332"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "samples",
        sa.Column("private", sa.Boolean(), nullable=True),
        schema="aspen",
    )
    # set existing samples private column to false
    conn = op.get_bind()
    sql = sa.sql.text(
        "UPDATE aspen.samples " "SET private = false " "WHERE private is NULL"
    )
    conn.execute(sql)
    # set private to be non-nullable
    op.alter_column(
        "samples",
        "private",
        existing_type=postgresql.BOOLEAN(),
        nullable=False,
        schema="aspen",
    )


def downgrade():
    op.drop_column("samples", "private", schema="aspen")
