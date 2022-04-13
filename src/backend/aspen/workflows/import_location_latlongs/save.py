# flake8: noqa: E711
# Doing a double-equals comparison to None is critical for the statements
# that use it to compile to the intended SQL, which is why tell flake8 to
# ignore rule E711 at the top of this file

import csv
import io

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


def load_latlongs(fh: io.TextIOBase):
    reader = csv.reader(fh, delimiter="\t")
    res = {}
    for row in reader:
        level, location, lat, lon = row
        if not level or not lat or not lon:
            continue
        if level not in res:
            res[level] = {}
        res[level][location] = lat, lon
    return res


def save(latlong_file: io.TextIOBase):
    config = Config()
    interface: SqlAlchemyInterface = init_db(get_db_uri(config))
    latlongs = load_latlongs()

    with session_scope(interface) as session:
        # Insert all locations from gisaid_metadata
        empty_latlongs_select = sa.select(Location).where(Location.latitude == None)
        rows = session.execute(empty_latlongs_select).scalars().all()
        for location in rows:
            level_key = "location"
            level_value = location.location
            if not location.location:
                level_key = "division"
                level_value = location.division
            if not location.division:
                level_key = "country"
                level_value = location.country
            latlong = latlongs.get(level_key, {}).get(level_value)
            if not latlong:
                print(
                    f"No latlong found for {location.region}/{location.country}/{location.division}/{location.location}"
                )
            latlong.latitude, latlong.longitude = latlong

        session.commit()

    print("Successfully imported latlongs!")


@click.command("save")
@click.option("--test", type=bool, is_flag=True)
@click.option(
    "latlong_file",
    "--latlongs",
    type=click.File("r", lazy=False),
    default="/ncov/defaults/lat_longs.tsv",
    required=True,
)
def cli(test: bool, latlong_file: io.TextIOBase):
    if test:
        print("Success!")
        return
    save()


if __name__ == "__main__":
    cli()
