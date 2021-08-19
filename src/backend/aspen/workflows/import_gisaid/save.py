import csv
import datetime
import io
import re
import uuid

import arrow
import click
from sqlalchemy import Column, MetaData, Table
from sqlalchemy.schema import CreateTable, DropTable

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import GisaidMetadata


def create_temp_table(session, source_table):
    metadata = MetaData()
    suffix = re.sub("-", "", str(uuid.uuid1()))
    table_name = f"{source_table.name}_{suffix}"
    cols = []
    for col in source_table.columns:
        cols.append(
            Column(
                col.name, col.type, primary_key=col.primary_key, nullable=col.nullable
            )
        )

    table_object = Table(table_name, metadata, *cols)
    session.execute(CreateTable(table_object))
    return table_object


def mv_table_contents(session, source_table, dest_table):
    cols = [col.name for col in dest_table.columns]
    session.execute(dest_table.delete())
    session.execute(dest_table.insert().from_select(cols, source_table.select()))


def drop_temp_table(session, table_obj):
    session.execute(DropTable(table_obj))


@click.command("save")
@click.option("metadata_fh", "--metadata-file", type=click.File("r"), required=True)
def cli(
    metadata_fh: io.TextIOBase,
):
    data = csv.DictReader(metadata_fh, delimiter="\t")

    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))
    fields_to_import = [
        "strain",
        "pango_lineage",
        "GISAID_clade",
        "region",
        "division",
        "location",
    ]
    num_rows = 0
    with session_scope(interface) as session:

        dest_table = GisaidMetadata.__table__
        temp_table = create_temp_table(session, dest_table)

        objects = []
        # We insert into a temporary table and then swap table contents with gisaid_metadata
        for row in data:
            num_rows += 1
            # add this row to the db
            metadata_fields = {field.lower(): row[field] for field in fields_to_import}
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
