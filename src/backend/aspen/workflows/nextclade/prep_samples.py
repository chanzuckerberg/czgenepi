"""
Writes out a FASTA for the sample PK ids specified by file.

Core approach here is a copy of what's in workflows/pangolin/export.py.
"""
import io
import json
from typing import IO, Iterable

import click
import sqlalchemy as sa
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
@click.option("pathogen_slug", "--pathogen-slug", type=str, required=True)
@click.option("sample_ids_fh", "--sample-ids-file", type=click.File("r"), required=True)
@click.option("sequences_fh", "--sequences", type=click.File("w"), required=True)
@click.option(
    "pathogen_info_fh", "--pathogen-info-file", type=click.File("w"), required=True
)
def cli(
    pathogen_slug: str,
    sample_ids_fh: io.TextIOBase,
    sequences_fh: io.TextIOBase,
    pathogen_info_fh: IO[str],
):
    """
    Writes out a FASTA for the specified samples.

    - pathogen_slug: Pathogen.slug for pathogen we are running Nextclade on
    - sample_ids_fh: A file of sample ID primary keys, one ID per line.
        Each sample must be for the same pathogen (all SARS-CoV-2, etc)
        and match against whatever `pathogen_slug` is.
    - sequences_fh: Output file to write FASTA for above samples.
        NOTE Resulting FASTA will have its id lines (>) be those primary keys,
        so anything that consumes these downstream results will be referring
        to samples by PK, not by private/public identifier.
    - pathogen_info_fh: Write out pathogen info for later use in workflow
    """
    sample_ids: list[int] = [int(id_line) for id_line in sample_ids_fh]
    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))
    with session_scope(interface) as session:
        print(f"Getting pathogen data for {pathogen_slug}")
        target_pathogen_query: Pathogen = sa.select(Pathogen).filter(
            Pathogen.slug == pathogen_slug
        )
        target_pathogen = session.execute(target_pathogen_query).scalars().one()
        save_pathogen_info(pathogen_info_fh, target_pathogen)

        print("Fetching and writing FASTA for sample ids:", sample_ids)
        # TODO update to SQLAlchemyV2 syntax
        all_samples: Iterable[Sample] = (
            session.query(Sample)
            .filter(Sample.id.in_(sample_ids))
            .options(
                joinedload(Sample.uploaded_pathogen_genome, innerjoin=True).undefer(
                    UploadedPathogenGenome.sequence
                ),
            )
        )

        for sample in all_samples:
            # Ensure all samples are expected pathogen before Nextclade run
            if sample.pathogen_id != target_pathogen.id:
                err_msg = (
                    f"ERROR -- Encountered unexpected pathogen in samples. "
                    f"Expected Pathogen.slug {pathogen_slug}, but encountered "
                    f"{sample.pathogen.slug} in given samples. There "
                    f"may also be others, this is just first difference found."
                )
                print(err_msg)
                raise RuntimeError("Samples do not match target pathogen")

            # joinedload innerjoin=True guarantees us having UPG, never None
            uploaded_pathogen_genome: UploadedPathogenGenome = (
                sample.uploaded_pathogen_genome  # type: ignore
            )
            stripped_sequence = uploaded_pathogen_genome.get_stripped_sequence()
            sequences_fh.write(f">{sample.id}\n")  # type: ignore
            sequences_fh.write(stripped_sequence)
            sequences_fh.write("\n")

        print("Finished writing FASTA for samples.")


def save_pathogen_info(pathogen_info_fh: IO[str], pathogen: Pathogen):
    """Write a JSON of important pathogen info for use later in workflow."""
    pathogen_info = {
        "pathogen_slug": pathogen.slug,
        # Not all pathogens have a dataset once we get to generalized case.
        # When that happens, will be None/null
        "nextclade_dataset_name": pathogen.nextclade_dataset_name,
    }
    json.dump(pathogen_info, pathogen_info_fh)


if __name__ == "__main__":
    cli()
