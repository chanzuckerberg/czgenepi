"""
Writes out a FASTA for the sample PK ids specified by file.

Core approach here is a copy of what's in workflows/pangolin/export.py.
"""
import io
import json
from typing import IO, Iterable, Optional

import click
from sqlalchemy.orm import joinedload

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import Pathogen, Sample, UploadedPathogenGenome


@click.command("export")
@click.option("sample_ids_fh", "--sample-ids-file", type=click.File("r"), required=True)
@click.option("sequences_fh", "--sequences", type=click.File("w"), required=True)
@click.option(
    "pathogen_info_fh", "--pathogen-info-file", type=click.File("w"), required=True
)
def cli(
    sample_ids_fh: io.TextIOBase,
    sequences_fh: io.TextIOBase,
    pathogen_info_fh: IO[str],
):
    """
    Writes out a FASTA for the specified samples.

    - sample_ids_fh: A file of sample ID primary keys, one ID per line.
        Each sample must be for the same pathogen (all SARS-CoV-2, etc)
    - sequences_fh: Output file to write FASTA for above samples.
        NOTE Resulting FASTA will have its id lines (>) be those primary keys,
        so anything that consumes these downstream results will be referring
        to samples by PK, not by private/public identifier.
    - pathogen_info_fh: Write out pathogen info for later use in workflow
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

        # Should pick it up as we run through samples. If missing at end, raise
        pathogen_of_all_samples: Optional[Pathogen] = None
        for sample in all_samples:

            # `.pathogen` access is lazy, but only accesses once per pathogen
            # type, so not an N+1 query issue where we need eager load.
            pathogen: Pathogen = sample.pathogen
            if pathogen_of_all_samples is None:
                pathogen_of_all_samples = pathogen
            # Safety: ensure all samples are same pathogen before Nextclade run
            if pathogen != pathogen_of_all_samples:
                err_msg = (
                    f"ERROR -- Encountered differing pathogen types in list "
                    f"of samples. Encountered both {pathogen.slug} and "
                    f"{pathogen_of_all_samples.slug} in given samples. There "
                    f"may also be others, this is just first difference found."
                )
                print(err_msg)
                raise RuntimeError("Samples given are not all same pathogen")

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

        print("Finished writing FASTA for samples.")
        if pathogen_of_all_samples is None:
            raise ValueError("No pathogen data available for samples")
        save_pathogen_info(pathogen_info_fh, pathogen_of_all_samples)


def save_pathogen_info(pathogen_info_fh: IO[str], pathogen: Pathogen):
    """Write a JSON of important pathogen info for use later in workflow."""
    pathogen_info = {
        "pathogen_slug": pathogen.slug,
        # Not all pathogens have a dataset once we get to generalized case.
        # When that happens, will be None/null
        "nextclade_dataset_name": pathogen.nextclade_dataset_name,
    }
    # Make it available in logs for debugging ease
    print("Info about pathogen in these samples:", pathogen_info)
    json.dump(pathogen_info, pathogen_info_fh)


if __name__ == "__main__":
    cli()
