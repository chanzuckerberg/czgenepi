import csv
import datetime
import io
import re
import uuid
from typing import Dict, List, Optional

import arrow
import click
import sqlalchemy as sa
from sqlalchemy import Column, MetaData, Table
from sqlalchemy.schema import CreateTable, DropTable

from aspen.api.settings import get_settings
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import Location


@click.command("save")
@click.option("location_fh", "--location-data", type=click.File("r"), required=True)
@click.option("--test", type=bool, is_flag=True)
async def cli(
    metadata_fh: io.TextIOBase,
    test: bool,
):
    if test:
        print("Success!")
        return
    data = csv.DictReader(metadata_fh, delimiter="\t")

    settings = get_settings()
    interface: SqlAlchemyInterface = init_async_db(settings.DB_DSN)
    fields_to_import = [
        "region",
        "country",
        "division",
        "location",
    ]
    num_rows = 0
    with session_scope(interface) as session:

        dest_table = Location.__table__
        temp_table = create_temp_table(session, dest_table)

        objects: List[Dict[str, Optional[str]]] = []
        # We need to only insert new rows, and we can't swap out a temp table
        # Since we want our ID's to be consistent.
        for row in data:
           query = (sa.select(Location)
                    .filter(sa.and_(
                        # TODO -- how does SA handle nulls here? Will it treat these as `= ""` or `is null` ?
                        Location.region == row.region,
                        Location.country == row.country,
                        Location.division == row.division,
                        Location.location == row.location,
                        )))
            res = await db.execute(query)
            try:
                # Try to find an existing location with the data in this row
                match = res.scalars.one()
            except:
                # If it doesn't find a match, insert a new row
                new_row = Location(region=row.region, country=row.country, division=row.division, location=row.location)
                session.add(new_row
        session.commit()

        print(f"Successfully imported {num_rows}")


if __name__ == "__main__":
    cli()
