import csv
import io

import click
import sqlalchemy as sa

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import Group, Location, Sample


def get_excluded_locations(session):
    # Generate a list of all locations that are associated with samples or
    # groups in our database so we can make sure they don't get translated
    # by the Nexstrain conversion
    locations = set([])  # A set means no duplicate values.
    queries = [
        # Locations that are tied to groups
        (
            sa.select(Location).join(
                Group, Group.default_tree_location_id == Location.id
            )
        ),
        # Locations that are tied to samples
        sa.select(Location).where(
            Location.id.in_(sa.select(Sample.location_id).distinct())
        ),
    ]
    for query in queries:
        dblocations = session.execute(query).unique().scalars().all()
        for loc in dblocations:
            # Make sure we exclude translations at both the location and the
            # division level.
            locations.add(f"{loc.region}/{loc.country}/{loc.division}/{loc.location}")
            locations.add(f"{loc.region}/{loc.country}/{loc.division}")

    return locations


@click.command("translate")
@click.option(
    "input_fh",
    "--input",
    type=click.File("r", lazy=False),
    default="/ncov-ingest/source-data/gisaid_geoLocationRules.tsv",
    required=True,
)
@click.option(
    "output_fh",
    "--input",
    type=click.File("w", lazy=False),
    default="/ncov-ingest/source-data/out.tsv",
    required=True,
)
def cli(
    input_fh: io.TextIOBase,
    output_fh: io.TextIOBase,
):
    """
    This utility rearranges Nextstrain's GISAID -> Nextstrain locations mapping file
    to instead be a GISAID -> CZ GEN EPI locations mapping file. Some of the locations
    in our database don't follow the Nextstrain location conventions and changes to
    Nextstrain's translations have broken our tree builds in the past.

    This translation file is tab-delimited with one source and destination mapping per line:
    old_location\tnew_location

    There are 4 main changes we make to the file:
    1. Remove any translations *from* a location in use by CZ GEN EPI entirely so
       upstream Nextstrain changes can't break them in the future.

       For example, Nexstrain may have a rule like this:
       North America/USA/New York/Orange County    North America/USA/New York/Orange County NY

       If we have a group that's using the "New York/Orange County" location, their
       CZ GEN EPI samples will be displayed on a tree with a different location name
       than the GISAID samples - and worse, any location queries in our tree build
       configurations won't match the GISAID samples properly.

    2. For any translations *to* a location that were skipped in #1 above, we need to
       change the new location so it matches the value in use by CZ GEN EPI. For example,
       Nextstrain often rolls up several smaller locations into a larger one like this:
       North America/USA/New York/Middletown    North America/USA/New York/Orange County NY

       But since we skipped mapping "Orange County" to "Orange County NY" above, we want
       to update this rule to look like this:
       North America/USA/New York/Middletown    North America/USA/New York/Orange County

    3. Add a few custom mappings of our own.
    """
    update_locations(input_fh, output_fh)


def update_locations(input_fh: io.TextIOBase, output_fh: io.TextIOBase):
    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))
    skip_translations = set([])  # Any translations we want to drop *without* remapping
    with session_scope(interface) as session:
        remap_translations = get_excluded_locations(session)

    # Where we stash output rows. The file is ~3MB so memory isn't an issue
    output_map = []

    # Keep track of which rules we've removed so we can remap any
    # destinations as necessary.
    translate_destinations = {}

    # Locations to skip entirely without remapping.
    skip_translations.add("North America/USA/Illinois/Chicago")

    reader = csv.reader(input_fh, delimiter="\t")
    # Load our file into memory and generate a map of destinations that
    # need to be rewritten
    for row in reader:
        source, dest = row
        # NOTE: The order of these checks matters!
        if source in skip_translations:
            continue
        if source in remap_translations:
            translate_destinations[dest] = source
            continue
        output_map.append([source, dest])

    # Add some extra translation rules to our file
    output_map.extend(
        [
            [
                "North America/USA/California/Southern San Joaquin Valley",
                "North America/USA/California/Tulare County",
            ]
        ]
    )

    print(translate_destinations)
    # Remap destinations and write our output file.
    for row in output_map:
        source, dest = row
        if dest in translate_destinations:
            dest = translate_destinations[dest]
        # This row isn't in our skip list, write it back to our output file.
        output_fh.write(f"{source}\t{dest}\n")


if __name__ == "__main__":
    cli()
