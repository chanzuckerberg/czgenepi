"""
Writes out a FASTA for the sample PK ids specified by file.

Approach here is pretty much a copy of what's in workflows/pangolin/export.py
Main tweak is that everything is based on the primary key ID of the sample
instead of using private/public identifiers because we want a clear,
unambiguous ID when working across multiple groups simultaneously.
"""
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
@click.option("sample_ids_fh", "--sample-ids-file", type=click.File("r"), required=True)
@click.option("sequences_fh", "--sequences", type=click.File("w"), required=True)
def cli(
    sample_ids_fh: io.TextIOBase,
    sequences_fh: io.TextIOBase,
):
    """
    Writes out a FASTA for the specified samples.

    - sample_ids_fh: A file of sample ID primary keys, one ID per line.
    - sequences_fh: Output file to write FASTA for above samples.
        NOTE Resulting FASTA will have its id lines (>) be those primary keys,
        so anything that consumes these downstream results will be referring
        to samples by PK, not by private/public identifier.
    """
    sample_ids: list[int] = [int(id_line) for id_line in sample_ids_fh]
    print("Fetching and writing FASTA for sample ids:", sample_ids)

    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))
    with session_scope(interface) as session:
        all_samples: Iterable[Sample] = (
            session.query(Sample)
            .filter(Sample.id.in_(sample_ids))
            .options(
                joinedload(Sample.uploaded_pathogen_genome).undefer(
                    UploadedPathogenGenome.sequence
                ),
            )
        )

        for sample in all_samples:
            uploaded_pathogen_genome = sample.uploaded_pathogen_genome

            # Samples _should_ always have uploaded_pathogen_genome with
            # sequence data on them in theory, but if it's missing, blow up.
            if uploaded_pathogen_genome is None:
                err_msg = (
                    f"ERROR -- Specified sample (id={sample.id}) is missing an "
                    f"associated uploaded_pathogen_genome. Cannot export FASTA "
                    f"for that sample. There may be other samples missing "
                    f"sequence data as well, this is just first encountered."
                )
                print(err_msg)
                raise RuntimeError(
                    f"sample.id={sample.id} missing genome sequence data"
                )

            stripped_sequence = uploaded_pathogen_genome.get_stripped_sequence()
            sequences_fh.write(f">{sample.id}\n")  # type: ignore
            sequences_fh.write(stripped_sequence)
            sequences_fh.write("\n")


if __name__ == "__main__":
    cli()
