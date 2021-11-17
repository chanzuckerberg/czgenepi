"""Add Locations Table

Create Date: 2021-11-17 21:36:11.102820

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20211117_213611"
down_revision = "20211117_213610"
branch_labels = None
depends_on = None


def upgrade():
    # TODO LIST:
    # X 1. Update gisaid import script to also populate the country field in the gisaid_metadata table
    # X 2. Find the list of supported nextstrain/gisaid locations and put *that* in the db instead of
    # X    just the list of existing sample locations from gisaid
    # 2a. Update the gisaid import job to keep this list up to date in the db.
    # 4. Update Orange County and Rickettsial lab samples to point to a real location
    # 5. Fix the test samples for the admin group
    # 6. Update all the existing sample rows in the DB to match a real location
    # 7. Create an API endpoint to return a list of locations
    # 8. Update upload form to be searchable textbox for location api endpoint
    # 9. Update upload form (or upload backend endpoint????) to find the appropriate location id to associate with a sample
    # --- AFTER the above is deployed ---
    # 10. remove sample, division, location fields from samples table, make sure the backend is 100% using associated location info.

    op.create_table(
        "locations",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("region", sa.String(), nullable=True),
        sa.Column("country", sa.String(), nullable=True),
        sa.Column("division", sa.String(), nullable=True),
        sa.Column("location", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_locations")),
        sa.UniqueConstraint(
            "region", "country", "division", "location", name=op.f("uq_locations_cols")
        ),
        schema="aspen",
    )
    op.add_column(
        "samples",
        sa.Column("location_id", sa.Integer(), nullable=True),
        schema="aspen",
    )
    op.create_foreign_key(
        op.f("fk_samples_locations"),
        "samples",
        "locations",
        ["location_id"],
        ["id"],
        source_schema="aspen",
        referent_schema="aspen",
    )
    conn = op.get_bind()
    insert_locations_sql = sa.sql.text(
        "INSERT INTO aspen.locations (region, division, location, country) select distinct region, division, location, country from aspen.gisaid_metadata"
    )
    conn.execute(insert_locations_sql)
    set_locations_sql = sa.sql.text(
        "UPDATE aspen.samples SET location_id = locations.id FROM aspen.locations WHERE samples.location = locations.location and samples.division = locations.division and samples.region = locations.region and samples.country = locations.country"
    )
    conn.execute(set_locations_sql)


def downgrade():
    pass
