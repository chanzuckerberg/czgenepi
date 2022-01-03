"""Migrate sample locations to location_id

Create Date: 2021-12-13 14:16:58.933547

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20211222_115458"
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

    deprecated_columns = ["region", "country", "division", "location"]
    with op.batch_alter_table("samples", schema="aspen") as batch_op:
        for column in deprecated_columns:
            batch_op.drop_column(column)


def downgrade():
    pass
