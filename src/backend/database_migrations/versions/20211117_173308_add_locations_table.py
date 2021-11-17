"""Add Locations Table

Create Date: 2021-11-17 17:33:10.102820

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20211117_173308"
down_revision = "20211109_213333"
branch_labels = None
depends_on = None


def upgrade():
    # TODO LIST:
    # 1. Update gisaid import script to also populate the country field in the gisaid_metadata table
    # 2. Find the list of supported nextstrain/gisaid locations and put *that* in the db instead of
    #    just the list of existing sample locations from gisaid
    # 2a. Update the gisaid import job to keep this list up to date in the db.
    # 4. Update Orange County and Rickettsial lab samples to point to a real location
    # 5. Fix the test samples for the admin group
    # 6. Update all the existing sample rows in the DB to match a real location
    # 7. Create an API endpoint to return a list of locations
    # 8. Update upload form to be searchable textbox for location api endpoint
    # 9. Update upload form (or upload backend endpoint????) to find the appropriate location id to associate with a sample
    # --- AFTER the above is deployed ---
    # 10. remove sample, division, location fields from samples table, make sure the backend is 100% using associated location info.

    op.add_column(
        "gisaid_metadata",
        sa.Column("country", sa.String(), nullable=True),
        schema="aspen",
    )
    op.create_table(
        "locations",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("region", sa.String(), nullable=False),
        sa.Column("division", sa.String(), nullable=False),
        sa.Column("location", sa.String(), nullable=False),
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
    insert_locations_sql = sa.sql.text(
        "INSERT INTO aspen.locations (region, division, location) select distinct region, division, location from gisaid_metadata"
    )
    conn.execute(insert_locations_sql)
    oc_sql = sa.sql.text(
        "UPDATE aspen.samples SET location = 'Orange County' where location = 'California' and sample_collected_by = 'Orange County Public Health Laboratory'"
    )
    # TODO, we don't actually know what to do here.
    rickettsial_sql = sa.sql.text(
        "UPDATE aspen.samples SET location = 'TODO' where location = 'NaN' and sample_collected_by = 'CA DPH Viral and Rickettsial Disease Laboratory'"
    )
    set_locations_sql = sa.sql.text(
        "UPDATE aspen.samples SET location_id = locations.id FROM locations WHERE samples.location = locations.location and samples.division = locations.division and samples.region = locations.region"
    )
    conn.execute(set_locations_sql)


def downgrade():
    pass
