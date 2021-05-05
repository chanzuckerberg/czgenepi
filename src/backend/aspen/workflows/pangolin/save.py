import csv
import io
from datetime import datetime

import click

from aspen.config.config import RemoteDatabaseConfig
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import PathogenGenome, UploadedPathogenGenome


@click.command("save")
@click.option("pangolin_fh", "--pangolin-csv", type=click.File("r"), required=True)
@click.option(
    "--pangolin-last-updated", type=click.DateTime(formats=["%m-%d-%Y"]), required=True
)
def cli(pangolin_fh: io.TextIOBase, pangolin_last_updated: datetime):
    interface: SqlAlchemyInterface = init_db(get_db_uri(RemoteDatabaseConfig()))

    with session_scope(interface) as session:
        pango_csv: csv.DictReader = csv.DictReader(pangolin_fh)
        for row in pango_csv:
            pathogen_genome: UploadedPathogenGenome = (
                session.query(PathogenGenome)
                .filter(PathogenGenome.entity_id == int(row["taxon"]))
                .one()
            )
            pathogen_genome.pangolin_lineage = row["lineage"]
            pathogen_genome.pangolin_probability = 1.0 - float(row["conflict"])  # type: ignore
            # TODO: change pangolin_version to date, looks like that's how pangolearn version is tracked
            pathogen_genome.pangolin_version = row["pangoLEARN_version"]
            pathogen_genome.pangolin_last_updated = pangolin_last_updated
            session.commit()


if __name__ == "__main__":
    cli()
