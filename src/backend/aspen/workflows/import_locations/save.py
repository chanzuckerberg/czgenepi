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
from aspen.database.models import Location, PublicRepositoryMetadata


def save():
    config = Config()
    interface: SqlAlchemyInterface = init_db(get_db_uri(config))

    with session_scope(interface) as session:
        # Insert all locations from public_repository_metadata
        metadata_locations_select = (
            sa.select(
                PublicRepositoryMetadata.region,
                PublicRepositoryMetadata.country,
                PublicRepositoryMetadata.division,
                PublicRepositoryMetadata.location,
            )
            .where(
                and_(
                    PublicRepositoryMetadata.location != "",
                    PublicRepositoryMetadata.location != None,
                )
            )
            .distinct()
        )
        metadata_locations_insert = (
            postgresql.insert(Location.__table__)
            .from_select(
                ["region", "country", "division", "location"], metadata_locations_select
            )
            .on_conflict_do_nothing(
                index_elements=("region", "country", "division", "location")
            )
        )
        session.execute(metadata_locations_insert)

        # Insert an entry with a null location for every distinct Region/Country/Division combination
        existing_null_location_select = (
            sa.select(Location.region, Location.country, Location.division)
            .where(Location.location == None)
            .distinct()
        )
        existing_null_locations = set(
            session.execute(existing_null_location_select).all()
        )

        metadata_null_locations_select = sa.select(
            PublicRepositoryMetadata.region,
            PublicRepositoryMetadata.country,
            PublicRepositoryMetadata.division,
        ).distinct()
        metadata_null_locations = set(
            session.execute(metadata_null_locations_select).all()
        )

        new_null_locations = metadata_null_locations - existing_null_locations
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

        # Insert country-level locations
        existing_country_level_loc_select = (
            sa.select(Location.region, Location.country)
            .where(and_(Location.division == None, Location.location == None))
            .distinct()
        )
        existing_country_level_locs = set(
            session.execute(existing_country_level_loc_select).all()
        )

        country_level_loc_select = sa.select(
            PublicRepositoryMetadata.region, PublicRepositoryMetadata.country
        ).distinct()
        country_level_locations = set(session.execute(country_level_loc_select).all())

        new_country_level_locations = (
            country_level_locations - existing_country_level_locs
        )
        new_country_level_values = list(
            map(
                lambda region_country_tuple: {
                    "region": region_country_tuple[0],
                    "country": region_country_tuple[1],
                    "division": None,
                    "location": None,
                },
                new_country_level_locations,
            )
        )
        if len(new_country_level_values) > 0:
            new_country_level_locations_insert = Location.__table__.insert().values(
                new_country_level_values
            )
            session.execute(new_country_level_locations_insert)

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
