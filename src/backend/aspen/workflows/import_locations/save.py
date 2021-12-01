import click
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

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
        gisaid_locations_select = sa.select(
            GisaidMetadata.region,
            GisaidMetadata.country,
            GisaidMetadata.division,
            GisaidMetadata.location,
        ).distinct()
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

        # Make sure we have equivalent rows for region/country/division but with null locations
        except_select = (
            sa.select(Location.region, Location.country, Location.division)
            .where(Location.location is None)
            .distinct()
        )
        null_locations_select = (
            sa.select(Location.region, Location.country, Location.division)
            .distinct()
            .except_(except_select)
        )
        null_locations_insert = Location.__table__.insert().from_select(
            ["region", "country", "division"], null_locations_select
        )
        session.execute(null_locations_insert)

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
