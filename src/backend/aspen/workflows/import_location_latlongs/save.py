# flake8: noqa: E711
# Doing a double-equals comparison to None is critical for the statements
# that use it to compile to the intended SQL, which is why tell flake8 to
# ignore rule E711 at the top of this file

import csv
import io
from typing import Optional

import click
import requests
import sqlalchemy as sa

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import Location


def load_latlongs(fh: io.TextIOBase):
    reader = csv.reader(fh, delimiter="\t")
    res = {}
    for row in reader:
        try:
            level, location, lat, lon = row
        except ValueError:
            continue
        if not level or not lat or not lon:
            continue
        if level not in res:
            res[level] = {}
        res[level][location] = lat, lon
    return res


def get_osm_location(location):
    if not location.country:
        return
    # Ncov often adds state suffixes to city names to make sure each location name is
    # unique. This is a bit heavy-handed, but we can try stripping off these suffixes
    # until we get an OSM hit.
    city_name_parts = []
    if location.location:
        city_name_parts = location.location.split()
    for num_parts in range(max(len(city_name_parts), 1), 0, -1):
        city = None
        if city_name_parts:
            city = " ".join(city_name_parts[:num_parts])
        query = {
            k: v
            for k, v in {
                "country": location.country,
                "state": location.division,
                "city": city,
            }.items()
            if v
        }
        print(query)
        query["format"] = "json"
        url = "https://nominatim.openstreetmap.org/search/"
        try:
            response = requests.get(url, params=query, timeout=2).json()
        except:
            continue
        if not response:
            continue
        loc = response[0]
        if loc.get("place_id"):
            return loc["lat"], loc["lon"]


def write_osm_tsv(session, outfile):
    empty_latlongs_select = sa.select(Location).where(Location.latitude == None)
    rows = session.execute(empty_latlongs_select).scalars().all()
    tsv = csv.writer(outfile, delimiter="\t")
    for location in rows:
        latlong = get_osm_location(location)
        if not latlong:
            continue
        loctype = "location"
        locname = location.location
        if not location.location:
            if location.division:
                loctype = "division"
                locname = location.division
            else:
                loctype = "country"
                locname = location.division
        tsv.writerow([loctype, locname, latlong[0], latlong[1]])
    outfile.close()


def import_ncov_latlongs(session, latlong_file):
    # Insert all locations from gisaid_metadata
    latlongs = load_latlongs(latlong_file)
    empty_latlongs_select = sa.select(Location).where(Location.latitude == None)
    rows = session.execute(empty_latlongs_select).scalars().all()
    num_committed = 0
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
            continue
        location.latitude, location.longitude = latlong
        num_committed += 1
        if num_committed > 1000:
            num_committed = 0
            session.commit()
    session.commit()


def save(latlong_file: io.TextIOBase, osm_output_file: Optional[io.TextIOBase]):
    config = Config()
    interface: SqlAlchemyInterface = init_db(get_db_uri(config))

    with session_scope(interface) as session:
        # Insert all locations from ncov's latlong db
        import_ncov_latlongs(session, latlong_file)
        # Try to load missing locations from open street maps.
        if osm_output_file:
            write_osm_tsv(session, osm_output_file)

    print("Successfully imported latlongs!")


@click.command("save")
@click.option("--test", type=bool, is_flag=True)
@click.option(
    "osm_output_file",
    "--osm-output",
    type=click.File("w", lazy=False),
    help="Include this flag to attempt to look up any missing locations in the OpenStreetMap database, and write any found locations to a TSV file for submission to ncov",
)
@click.option(
    "latlong_file",
    "--latlongs",
    type=click.File("r", lazy=False),
    default="/ncov/defaults/lat_longs.tsv",
)
def cli(
    test: bool, osm_output_file: Optional[io.TextIOBase], latlong_file: io.TextIOBase
):
    if test:
        print("Success!")
        return
    save(latlong_file, osm_output_file)


if __name__ == "__main__":
    cli()
