# flake8: noqa: E711
# Doing a double-equals comparison to None is critical for the statements
# that use it to compile to the intended SQL, which is why tell flake8 to
# ignore rule E711 at the top of this file

import csv
import io
import urllib

import click
import requests
import sqlalchemy as sa
from sqlalchemy.sql.expression import and_

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import Location


def save(latlong_file: io.TextIOBase):
    config = Config()
    interface: SqlAlchemyInterface = init_db(get_db_uri(config))
    with session_scope(interface) as session:
        # Insert all locations from gisaid_metadata
        empty_latlongs_select = sa.select(Location).where(
            and_(Location.source == "osm"), (Location.latitude != None)
        )
        rows = session.execute(empty_latlongs_select).scalars().all()
        outfile = open("osm_locations.tsv", "w")
        tsv = csv.writer(outfile, delimiter="\t")
        for location in rows:
            loctype = "location"
            locname = location.location
            if not location.location:
                if location.division:
                    loctype = "division"
                    locname = location.division
                else:
                    loctype = "country"
                    locname = location.division
            tsv.writerow([loctype, locname, location.latitude, location.longitude])
        outfile.close()


@click.command("save")
@click.option("--test", type=bool, is_flag=True)
@click.option(
    "latlong_file",
    "--latlongs",
    type=click.File("r", lazy=False),
    default="/ncov/defaults/lat_longs.tsv",
)
def cli(test: bool, latlong_file: io.TextIOBase):
    if test:
        print("Success!")
        return
    save(latlong_file)


if __name__ == "__main__":
    cli()
