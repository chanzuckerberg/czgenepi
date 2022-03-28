import csv
import datetime
import io
from typing import Dict, List, Optional, Union

import arrow
import click

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import GisaidMetadata
from aspen.workflows.shared_utils.database import (
    create_temp_table,
    drop_temp_table,
    mv_table_contents,
)


@click.command("save")
@click.option("metadata_fh", "--metadata-file", type=click.File("r"), required=True)
@click.option("--test", type=bool, is_flag=True)
def cli(
    metadata_fh: io.TextIOBase,
    test: bool,
):
    if test:
        print("Success!")
        return
    data = csv.DictReader(metadata_fh, delimiter="\t")

    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))
    fields_to_import = [
        "strain",
        "pango_lineage",
        "GISAID_clade",
        "gisaid_epi_isl",
        "region",
        "country",
        "division",
        "location",
    ]
    num_rows = 0
    with session_scope(interface) as session:

        dest_table = GisaidMetadata.__table__
        temp_table = create_temp_table(session, dest_table)

        objects: List[Dict[str, Union[Optional[str], Optional[datetime.datetime]]]] = []
        # We insert into a temporary table and then swap table contents with gisaid_metadata
        for row in data:
            num_rows += 1
            # add this row to the db
            metadata_fields: Dict[
                str, Union[Optional[str], Optional[datetime.datetime]]
            ] = {field.lower(): row[field] for field in fields_to_import}
            if num_rows % 20000 == 0:
                session.execute(temp_table.insert(), objects)
                print(f"{datetime.datetime.now()} - {num_rows} inserted")
                objects = []
            try:
                metadata_fields["date"] = arrow.get(row["date"]).datetime
            except arrow.parser.ParserError:
                metadata_fields["date"] = None  # Date isn't parseable
            objects.append(metadata_fields)
        if objects:
            session.execute(temp_table.insert(), objects)
            print(f"{datetime.datetime.now()} - {num_rows} inserted -- complete!")
        # Replace all the gisaid metadata info with the latest import.
        mv_table_contents(session, temp_table, dest_table)
        drop_temp_table(session, temp_table)
        session.commit()

        print(f"Successfully imported {num_rows}")


if __name__ == "__main__":
    cli()
