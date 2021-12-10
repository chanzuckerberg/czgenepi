# flake8: noqa: E711
# Doing a double-equals comparison to None is critical for the statements
# that use it to compile to the intended SQL, which is why tell flake8 to
# ignore rule E711 at the top of this file

import click
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy.sql.expression import and_

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import GisaidMetadata, Location


def save():
    config = Config()
    interface: SqlAlchemyInterface = init_db(get_db_uri(config))

    with session_scope(interface) as session:
        # Insert all locations from gisaid_metadata
        gisaid_locations_select = (
            sa.select(
                GisaidMetadata.region,
                GisaidMetadata.country,
                GisaidMetadata.division,
                GisaidMetadata.location,
            )
            .where(and_(GisaidMetadata.location != "", GisaidMetadata.location != None))
            .distinct()
        )
        gisaid_locations_insert = (
            postgresql.insert(Location.__table__)
            .from_select(
                ["region", "country", "division", "location"], gisaid_locations_select
            )
            .on_conflict_do_nothing(
                index_elements=("region", "country", "division", "location")
            )
        )
        session.execute(gisaid_locations_insert)

        # Insert an entry with a null location for every distinct Region/Country/Division combination
        existing_null_location_select = (
            sa.select(Location.region, Location.country, Location.division)
            .where(Location.location == None)
            .distinct()
        )
        existing_null_locations = set(
            session.execute(existing_null_location_select).all()
        )

        gisaid_null_locations_select = sa.select(
            GisaidMetadata.region,
            GisaidMetadata.country,
            GisaidMetadata.division,
        ).distinct()
        gisaid_null_locations = set(session.execute(gisaid_null_locations_select).all())

        new_null_locations = gisaid_null_locations - existing_null_locations
        new_null_location_values = list(
            map(
                lambda region_country_division_tuple: {
                    "region": region_country_division_tuple[0],
                    "country": region_country_division_tuple[1],
                    "division": region_country_division_tuple[2],
                    "location": None,
                },
                new_null_locations,
            )
        )
        if len(new_null_location_values) > 0:
            new_null_locations_insert = Location.__table__.insert().values(
                new_null_location_values
            )
            session.execute(new_null_locations_insert)

        session.commit()

    print("Successfully imported locations!")


@click.command("save")
@click.option("--test", type=bool, is_flag=True)
def cli(test: bool):
    if test:
        print("Success!")
        return
    save()


if __name__ == "__main__":
    cli()
