import datetime

import click
import uuid
import csv

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import (
    AlignedGisaidDump,
    GisaidAlignmentWorkflow,
    ProcessedGisaidDump,
    WorkflowStatusType,
)
from aspen.database.models.workflow import SoftwareNames


@click.command("save")
@click.option("metadata_fh", "--metadata-file", type=click.File("r"), required=True)
def cli(
    metadata_fh: io.TextIOBase,
):
    import_id = str(uuid.uuid1)
    rd = csv.reader(metadata_fh, delimiter="\t", quotechar='"')
    headers = rd.next()
    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))
    with session_scope(interface) as session:
        for row in rd:
            # add row to the db
            SomeDbModel.insert(field1, field2, field3)

        session.flush()
        # delete from SomeDbModel where import_id != {import_id}
        print("huge success!")


if __name__ == "__main__":
    cli()
