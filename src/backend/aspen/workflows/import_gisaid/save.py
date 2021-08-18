import csv
import datetime
import io
import uuid

import arrow
import click
from sqlalchemy.dialects.postgresql import insert

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import GisaidMetadata


@click.command("save")
@click.option("metadata_fh", "--metadata-file", type=click.File("r"), required=True)
def cli(
    metadata_fh: io.TextIOBase,
):
    import_id = str(uuid.uuid1())
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
        session.autoflush = True
        for row in data:
            num_rows += 1
            # add this row to the db
            strain = row["strain"]
            metadata_fields = {field.lower(): row[field] for field in fields_to_import}
            metadata_fields["import_id"] = import_id
            metadata_fields["date"] = arrow.get(row["date"]).datetime
            upsert_statement = insert(GisaidMetadata, bind=session).values(
                **metadata_fields
            )
            upsert_statement = upsert_statement.on_conflict_do_update(
                index_elements=["strain"], set_=metadata_fields
            )
            session.execute(upsert_statement)
        # Delete any rows that weren't part of the latest import.
        session.query(GisaidMetadata).filter(
            GisaidMetadata.import_id != import_id
        ).delete()
        session.commit()

        print(f"Successfully imported {num_rows}")


if __name__ == "__main__":
    cli()
