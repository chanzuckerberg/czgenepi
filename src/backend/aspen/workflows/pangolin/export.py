import io
from typing import Iterable

import click
from sqlalchemy.orm import joinedload

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import Sample, UploadedPathogenGenome


@click.command("export")
@click.option("samples_fh", "--sample-ids-file", type=click.File("r"), required=True)
@click.option("sequences_fh", "--sequences", type=click.File("w"), required=True)
def cli(samples_fh: io.TextIOBase, sequences_fh: io.TextIOBase):
    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))

    sample_public_identifiers: list[str] = samples_fh.read().split("\n")

    with session_scope(interface) as session:
        all_samples: Iterable[Sample] = (
            session.query(Sample)
            .filter(Sample.public_identifier.in_(sample_public_identifiers))
            .options(
                joinedload(Sample.uploaded_pathogen_genome).undefer(
                    UploadedPathogenGenome.sequence
                ),
            )
        )

        for sample in all_samples:
            pathogen_genome = sample.uploaded_pathogen_genome

            sequence: str = "".join(
                [
                    line
                    for line in pathogen_genome.sequence.splitlines()  # type: ignore
                    if not (line.startswith(">") or line.startswith(";"))
                ]
            )

            stripped_sequence: str = sequence.strip("Nn")
            sequences_fh.write(f">{pathogen_genome.entity_id}\n")  # type: ignore
            sequences_fh.write(stripped_sequence)
            sequences_fh.write("\n")


if __name__ == "__main__":
    cli()
