"""Migrate sample locations to location_id

Create Date: 2021-12-13 14:16:58.933547

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20211213_141658"
down_revision = "20211117_213611"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    old_sample_locations_stmt = sa.sql.text(
        "SELECT DISTINCT region, country, division, location FROM aspen.samples"
    )
    old_sample_location_rows = conn.execute(old_sample_locations_stmt).all()
    old_sample_locations = list(
        map(
            lambda row: {
                "region": row[0],
                "country": row[1],
                "division": row[2],
                "location": row[3],
            },
            old_sample_location_rows,
        )
    )

    get_new_location_stmt = sa.sql.text(
        "SELECT id FROM aspen.locations WHERE region=:region AND country=:country AND division=:division AND location=:location"
    )
    get_broad_location_stmt = sa.sql.text(
        "SELECT id FROM aspen.locations WHERE region=:region AND country=:country AND division=:division AND location IS NULL"
    )
    set_location_id_stmt = sa.sql.text(
        "UPDATE aspen.samples SET location_id=:location_id WHERE region=:region AND country=:country AND division=:division AND location=:location"
    )

    for loc in old_sample_locations:
        new_location_result = conn.execute(
            get_new_location_stmt.bindparams(
                region=loc["region"],
                country=loc["country"],
                division=loc["division"],
                location=loc["location"],
            )
        )
        new_location_id = new_location_result.scalars().one_or_none()
        if not new_location_id:
            broader_location_result = conn.execute(
                get_broad_location_stmt.bindparams(
                    region=loc["region"],
                    country=loc["country"],
                    division=loc["division"],
                )
            )
            broader_location_id = broader_location_result.scalars().one_or_none()
            if broader_location_id:
                new_location_id = broader_location_id
        conn.execute(
            set_location_id_stmt.bindparams(
                location_id=new_location_id,
                region=loc["region"],
                country=loc["country"],
                division=loc["division"],
                location=loc["location"],
            )
        )

    with op.batch_alter_table("samples") as batch_op:
        batch_op.drop_column("region")
        batch_op.drop_column("column")
        batch_op.drop_column("division")
        batch_op.drop_column("location")


def downgrade():
    pass
