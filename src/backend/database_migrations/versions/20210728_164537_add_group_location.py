"""add group location

Create Date: 2021-07-28 16:45:40.243713

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

revision = "20210728_164537"
down_revision = "20210727_173522"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "groups",
        sa.Column("division", sa.String(), nullable=True),
        schema="aspen",
    )
    op.add_column(
        "groups",
        sa.Column("location", sa.String(), nullable=True),
        schema="aspen",
    )

    # All samples submitted by a given county currently have the same location & division values.
    update_groups_sql = sa.sql.text(
        "UPDATE aspen.groups as g SET location = s.location, division = s.division FROM aspen.samples as s WHERE s.submitting_group_id = g.id"
    )
    conn = op.get_bind()
    conn.execute(update_groups_sql)


def downgrade():
    # downgrading db's is evil, don't do it
    op.drop_column("groups", "division", schema="aspen")
    op.drop_column("groups", "location", schema="aspen")
