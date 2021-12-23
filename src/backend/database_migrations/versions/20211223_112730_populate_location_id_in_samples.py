"""Populate location_id in samples

Create Date: 2021-12-23 11:27:30

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20211223_112730"
down_revision = "20211214_003923"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    set_full_locations_stmt = sa.sql.text(
        "UPDATE aspen.samples as s SET location_id = (SELECT id FROM aspen.locations as l WHERE l.region = s.region AND l.country = s.country AND l.division = s.division and l.location = s.location)"
    )
    conn.execute(set_full_locations_stmt)

    set_broader_locations_stmt = sa.sql.text(
        "UPDATE aspen.samples as s SET location_id = (SELECT id FROM aspen.locations as l WHERE l.region = s.region AND l.country = s.country AND l.division = s.division and l.location is NULL) WHERE s.location IN ('California', 'NaN', '', NULL)"
    )
    conn.execute(set_broader_locations_stmt)


def downgrade():
    pass
