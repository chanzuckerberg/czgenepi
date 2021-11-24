import click

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)


@click.command("save")
@click.option("--test", type=bool, is_flag=True)
def cli(
    test: bool,
):
    if test:
        print("Success!")
        return

    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))
    with session_scope(interface) as session:
        # Insert all locations from gisaid_metadata
        insert_rows_from_gisaid = "INSERT INTO aspen.locations (region, country, division, location) SELECT DISTINCT region, country, division, location FROM aspen.gisaid_metadata ON CONFLICT (region, country, division, location) DO NOTHING"
        # Make sure we have equivalent rows for region/country/division but with null locations
        insert_rows_with_null_locations = "INSERT INTO aspen.locations (region, country, division) SELECT DISTINCT region, country, division FROM aspen.locations EXCEPT SELECT DISTINCT region, country, division FROM aspen.locations WHERE location IS NULL"
        session.execute(insert_rows_from_gisaid)
        session.execute(insert_rows_with_null_locations)

        session.commit()

        print("Successfully imported locations!")


if __name__ == "__main__":
    cli()
