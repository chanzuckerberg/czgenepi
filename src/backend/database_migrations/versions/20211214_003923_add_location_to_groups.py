"""Add Location to Groups

Create Date: 2021-12-14 00:39:25.682465

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20211214_003923"
down_revision = "20211117_213611"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "groups",
        sa.Column("location_id", sa.Integer(), nullable=True),
        schema="aspen",
    )
    op.create_foreign_key(
        op.f("fk_groups_locations"),
        "groups",
        "locations",
        ["location_id"],
        ["id"],
        source_schema="aspen",
        referent_schema="aspen",
    )

    conn = op.get_bind()

    non_null_locations = sa.sql.text("""
            update groups g set location_id = (select id from locations l where l.location = g.location and l.division = g.division and l.country = 'USA' and l.region = 'North America') where g.location is not null and g.location != 'NaN'
            """)
    null_locations = sa.sql.text("""
update groups g set location_id = (select id from locations l where l.location is null and l.division = g.division and l.country = 'USA' and l.region = 'North America') where g.location is null or g.location = 'NaN'
            """)
    conn.execute(non_null_locations)
    conn.execute(null_locations)


def downgrade():
    # Don't downgrade.
    pass
