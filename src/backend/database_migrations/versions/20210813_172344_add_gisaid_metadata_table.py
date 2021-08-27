"""add gisaid metadata table

Create Date: 2021-08-13 17:23:45.978372

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20210813_172344"
down_revision = "20210803_112019"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "gisaid_metadata",
        sa.Column("strain", sa.String(), nullable=False),
        sa.Column("pango_lineage", sa.String(), nullable=True),
        sa.Column("gisaid_clade", sa.String(), nullable=True),
        sa.Column("date", sa.DateTime(), nullable=True),
        sa.Column("region", sa.String(), nullable=True),
        sa.Column("division", sa.String(), nullable=True),
        sa.Column("location", sa.String(), nullable=True),
        sa.Column("import_id", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("strain", name=op.f("pk_gisaid_metadata")),
        schema="aspen",
    )


def downgrade():
    # Don't downgrade
    pass
