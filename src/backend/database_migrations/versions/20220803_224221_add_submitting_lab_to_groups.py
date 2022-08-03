"""add submitting lab to groups

Create Date: 2022-08-03 22:42:27.655366

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220803_224221"
down_revision = "20220621_232148"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "groups",
        sa.Column("submitting_lab", sa.String(), nullable=True),
        schema="aspen",
    )

    conn = op.get_bind()
    populate_submitting_lab_sql = sa.sql.text(
        "UPDATE aspen.groups SET submitting_lab = name"
    )
    conn.execute(populate_submitting_lab_sql)


def downgrade():
    pass
