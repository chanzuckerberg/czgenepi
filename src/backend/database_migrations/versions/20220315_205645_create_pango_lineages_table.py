"""Create pango_lineages table

Create Date: 2022-03-15 20:56:46.694291

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220315_205645"
down_revision = "20220215_194838"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "pango_lineages",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("lineage", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_pango_lineages")),
        sa.UniqueConstraint("lineage", name=op.f("uq_pango_lineages_lineage")),
        schema="aspen",
    )


def downgrade():
    op.drop_table("pango_lineages", schema="aspen")
