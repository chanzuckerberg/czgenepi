import csv
from datetime import datetime
import io
from typing import Dict, IO, Set, Optional

from Bio import SeqIO
import click
import sqlalchemy as sa
from sqlalchemy.orm.session import Session

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import (
    AlignedPathogenGenome,
    LineageType,
    MutationsCaller,
    QCMetricCaller,
    Sample,
    SampleLineage,
    SampleMutation,
    SampleQCMetric,
)
from aspen.workflows.nextclade.utils import extract_dataset_info

# TODO, create an enum table for below and standard nextclade QC overallStatus
INVALID_RESULT_STATUS = "invalid"

FAILED_LINEAGE_STATUS = "FAILED"


@click.command("save")
@click.option("nextclade_fh", "--nextclade-csv", type=click.File("r"), required=True)
@click.option(
    "nextclade_aligned_fasta_fh", "--nextclade-aligned-fasta", type=click.File("r"), required=True
)
@click.option(
    "nextclade_tag_fh", "--nextclade-dataset-tag", type=click.File("r"), required=True
)
@click.option("nextclade_version", "--nextclade-version", type=str, required=True)
@click.option("nextclade_run_datetime", "--nextclade-run-datetime",
    type=click.DateTime(formats=["%Y-%m-%dT%H:%M:%S"]), required=True)
@click.option("pathogen_slug", "--pathogen-slug", type=str, required=True)
def cli(
    nextclade_fh: io.TextIOBase,
    nextclade_aligned_fasta_fh: io.TextIOBase,
    nextclade_tag_fh: IO[str],
    nextclade_version: str,
    nextclade_run_datetime: datetime,
    pathogen_slug: str,
):
    """Go through results from nextclade run, save to DB for each sample."""
    print("Beginning to save Nextclade results to DB.")
    # Track info about the dataset that was used to produce results being saved
    dataset_info = extract_dataset_info(nextclade_tag_fh)
    # Set of sample_ids for all samples we expect will be in aligned fasta.
    aligned_fasta_expected: Set[int] = set()

    # This can be a lot of samples, so batch up commits as we go.
    COMMIT_CHUNK_SIZE = 1000  # This number has worked fine in manual running.
    entry_count_so_far = 0  # Final value will be total count.

    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))
    with session_scope(interface) as session:
        nextclade_csv: csv.DictReader = csv.DictReader(nextclade_fh, delimiter=";")
        for row in nextclade_csv:
            entry_count_so_far += 1
            # For entire workflow, we use sample id primary keys for names.
            sample_id = int(row["seqName"])
            sample_q = sa.select(Sample).where(Sample.id == sample_id)
            sample = session.execute(sample_q).scalars().one()

            is_result_valid = is_nextclade_result_valid(row)
            # We always record QC info for any sample run, even if invalid.
            qc_score: Optional[str] = row["qc.overallScore"]
            qc_status = row["qc.overallStatus"]
            if is_result_valid:
                # If valid result, we expect it will have an aligned sequence
                aligned_fasta_expected.add(sample_id)
            else:
                # If result was invalid, mark QC info accordingly
                qc_score = None
                qc_status = INVALID_RESULT_STATUS

            existing_qc_metric_q = (
                sa.select(SampleQCMetric)
                .join(SampleQCMetric.sample)
                .filter(
                    SampleQCMetric.sample == sample,
                    SampleQCMetric.qc_caller == QCMetricCaller.NEXTCLADE,
                )
            )
            qc_metric = session.execute(existing_qc_metric_q).scalars().one_or_none()
            if qc_metric is None:
                qc_metric = SampleQCMetric(
                    sample=sample,
                    qc_caller=QCMetricCaller.NEXTCLADE,
                    qc_score=qc_score,
                    qc_status=qc_status,
                    raw_qc_output={key: value for key, value in row.items()},
                    qc_software_version=nextclade_version,
                    reference_dataset_name=dataset_info["name"],
                    reference_sequence_accession=dataset_info["accession"],
                    reference_dataset_tag=dataset_info["tag"],
                )
            else:
                qc_metric.qc_score = qc_score
                qc_metric.qc_status = qc_status
                qc_metric.raw_qc_output = {key: value for key, value in row.items()}
                qc_metric.qc_software_version = nextclade_version
                qc_metric.reference_dataset_name = dataset_info["name"]
                qc_metric.reference_sequence_accession = dataset_info["accession"]
                qc_metric.reference_dataset_tag = dataset_info["tag"]
            session.add(qc_metric)

            # If run was invalid, we still set mutation, but all mutation data saved will be empty strings
            existing_mutation_q = (
                sa.select(SampleMutation)
                .join(SampleMutation.sample)
                .filter(
                    SampleMutation.sample == sample,
                    SampleMutation.mutations_caller == MutationsCaller.NEXTCLADE,
                )
            )
            mutation = session.execute(existing_mutation_q).scalars().one_or_none()

            if mutation is None:
                mutation = SampleMutation(
                    sample=sample,
                    mutations_caller=MutationsCaller.NEXTCLADE,
                    substitutions=row["substitutions"],
                    insertions=row["insertions"],
                    deletions=row["deletions"],
                    aa_substitutions=row["aaSubstitutions"],
                    aa_insertions=row["aaInsertions"],
                    aa_deletions=row["aaDeletions"],
                    reference_sequence_accession=dataset_info["accession"],
                )
            else:
                mutation.substitutions = row["substitutions"]
                mutation.insertions = row["insertions"]
                mutation.deletions = row["deletions"]
                mutation.aa_substitutions = row["aaSubstitutions"]
                mutation.aa_insertions = row["aaInsertions"]
                mutation.aa_deletions = row["aaDeletions"]
                mutation.reference_sequence_accession = dataset_info["accession"]
            session.add(mutation)

            # If SC2 (covid) we use Pangolin, not Nextclade.
            if pathogen_slug != "SC2":
                # lineage will return FAILED if sample did not match well against reference
                lineage = get_lineage_from_row(row, is_result_valid)

                existing_sample_lineage_q = (
                    sa.select(SampleLineage)
                    .join(SampleLineage.sample)
                    .filter(
                        SampleLineage.sample == sample,
                        SampleLineage.lineage_type == LineageType.NEXTCLADE,
                    )
                )

                sample_lineage = (
                    session.execute(existing_sample_lineage_q).scalars().one_or_none()
                )

                if sample_lineage is None:
                    sample_lineage = SampleLineage(
                        sample=sample,
                        lineage_type=LineageType.NEXTCLADE,
                        lineage_software_version=nextclade_version,
                        lineage=lineage,
                        reference_dataset_name=dataset_info["name"],
                        reference_sequence_accession=dataset_info["accession"],
                        reference_dataset_tag=dataset_info["tag"],
                    )
                else:
                    sample_lineage.lineage_software_version = nextclade_version
                    sample_lineage.lineage = lineage
                    sample_lineage.reference_dataset_name = dataset_info["name"]
                    sample_lineage.reference_sequence_accession = dataset_info[
                        "accession"
                    ]
                    sample_lineage.reference_dataset_tag = dataset_info["tag"]
                session.add(sample_lineage)

            if entry_count_so_far % COMMIT_CHUNK_SIZE == 0:
                session.commit()
        # Don't forget to commit the last chunk of entries that remain!
        session.commit()
        print("Finished saving Nextclade CSV results to DB.")
        print(f"Total count of samples run and saved: {entry_count_so_far}")

        # Now that CSV saving is done, we handle saving aligned sequence data
        ids_in_aligned_fasta = save_aligned_genomes(
            session,
            nextclade_aligned_fasta_fh,
            dataset_info["accession"],
            nextclade_run_datetime,
            )
        # The `aligned_fasta_expected` ids **should** exactly match all the ids
        # found in the FASTA. If there's a difference something weird is going
        # on and we should at least have some warning logs. Maybe even fail?
        unexpected_ids = ids_in_aligned_fasta - aligned_fasta_expected
        if unexpected_ids:
            print("WARNING -- Aligned FASTA had ids that were not expected!")
            print(
                "List of ids that were not expected to be present:",
                sorted(unexpected_ids),
            )
        missing_ids = aligned_fasta_expected - ids_in_aligned_fasta
        if missing_ids:
            print("WARNING -- Aligned FASTA was missing ids we expected!")
            print(
                "List of ids that were expected in FASTA but not found:",
                sorted(missing_ids),
            )



def is_nextclade_result_valid(nextclade_csv_row: Dict[str, str]) -> bool:
    """Not all sequences succeed in run. Results with errors should be ignored.

    When running Nextclade, sequences can fail for various reasons. If a
    sequence fails, it will either have associated `errors` or `warnings`.
    Those are present in the general results file, and also duplicated to
    their own special error file (nextclade.errors.csv).

    If something shows up for `errors`, we should definitely consider the
    sequence invalid. Sadly, `warnings` is more of a gray area. Talking to
    Comp Bio, it seems that in some cases, we'll have `warnings` indicate
    that the sequence was invalid, but in other cases, it's possible to have
    warnings that are unimportant. To get around this, `qc.overallScore` can be
    used as a proxy metric. Experimenting with the Nextclade tool, it seems to
    be that an invalid sequence gets blanked out in its CSV almost across the
    board. So since qc.overallScore should always be present in a valid
    sequence, if there are warnings and it's missing, consider sample invalid.

    There is also a `failedGenes` field: it's currently an open Comp Bio
    question if we need to do anything based on that being populated, or if
    it's okay to just ignore it. Right now it seems like it's fine to ignore
    for our use-case, but that might change in the future."""
    is_result_valid = True
    if nextclade_csv_row["errors"] != "":
        is_result_valid = False
    elif nextclade_csv_row["warnings"] != "" and nextclade_csv_row["qc.overallScore"] == "":
        is_result_valid = False
    return is_result_valid


def get_lineage_from_row(
    nextclade_csv_row: Dict[str, str], is_result_valid: bool
) -> str:
    """Gets lineage value for a sample from the dict of its Nextclade CSV row.

    Background: the `clade` is generally available when looking at the sequence
    for any pathogen. Finer-grained lineage detail was not really common
    before SARS-CoV-2. However, newer techniques (ala Pangolin) provide that
    finer detail, but that detail being available is dependent on there having
    been tooling developed to handle the specific pathogen. Different pathogens
    may or may not have that level of detail available. If it's available, we
    want to use it, but if not, we fall back to coarser-grained `clade`.

    The availability of the `lineage` key specifically is a bit unclear at the
    moment. Nextclade's documentation does _not_ guarantee its existence:
        https://docs.nextstrain.org/projects/nextclade/en/latest/user/output-files.html
    Instead, certain pathogens/clades have additional columns, and those may or
    may not contain finer-grained lineage info. For Monkeypox specifically, the
    `lineage` column is provided. It's unclear if this convention will continue
    to be followed as Nextclade continues to support more pathogens, or if it
    will be totally dependent on the specific pathogen we run Nextclade on.

    For now, if you're adding support for a new pathogen, you should make sure
    to run Nextclade against some sequences for that pathogen, inspect the
    results, and check in with Comp Bio colleagues.
    """

    lineage = nextclade_csv_row.get("lineage")

    if lineage is None:
        lineage = nextclade_csv_row["clade"]

    # if the sample is very low quality or unable to be matched against reference, there will be no lineage assigned, return FAILED
    if not is_result_valid or lineage == "":
        return FAILED_LINEAGE_STATUS

    return lineage


def save_aligned_genomes(
    session: Session,
    aligned_fasta_file: io.TextIOBase,
    latest_reference_name: str,
    nextclade_run_datetime: datetime,
    # TODO add taking timestamp, use bash
    ) -> Set[int]:
    """DOCME
    TODO VOODOO -- have this output a set of the saved ids, then callsite can compare and warn

    - Talk about the `id` versus `description` aspect and how we get what we
    want out of it. Also can mention name is equivalent to id for fastas"""
    # This can be a lot of data, so batch up commits as we go.
    COMMIT_CHUNK_SIZE = 100  # Number was picked out of thin air. Seems sane?
    apg_to_save_so_far = 0  # Final value will be count /actually/ saved to DB.

    ids_in_aligned_fasta: Set[int] = set()
    parsed_fasta = SeqIO.parse(aligned_fasta_file, "fasta")
    for record in parsed_fasta:
        sample_id = int(record.id)
        ids_in_aligned_fasta.add(sample_id)
        existing_aligned_pathogen_genome_q = (
            sa.select(AlignedPathogenGenome)
            .filter(AlignedPathogenGenome.sample_id == sample_id)
        )
        aligned_pathogen_genome = session.execute(existing_aligned_pathogen_genome_q).scalars().one_or_none()

        should_add_to_session = False
        if aligned_pathogen_genome is None:
            aligned_pathogen_genome = AlignedPathogenGenome(
                sample_id=sample_id,
                sequence=str(record.seq),
                reference_name=latest_reference_name,
                aligned_date=nextclade_run_datetime,
            )
            should_add_to_session = True
        # If pre-existing APG, no need to update unless changed reference seq.
        elif aligned_pathogen_genome.reference_name != latest_reference_name:
            aligned_pathogen_genome.sequence = str(record.seq)
            aligned_pathogen_genome.reference_name = latest_reference_name
            aligned_pathogen_genome.aligned_date = nextclade_run_datetime
            should_add_to_session = True

        if should_add_to_session:
            session.add(aligned_pathogen_genome)
            apg_to_save_so_far += 1
        if apg_to_save_so_far % COMMIT_CHUNK_SIZE == 0:
            session.commit()
    # Don't forget to commit the last chunk of entries that remain!
    session.commit()
    print("Finished saving Nextclade aligned genomes to DB.")
    print(f"Total count of aligned pathogen genomes added (new) or updated "
        f"(existing): {apg_to_save_so_far}."
        )

    return ids_in_aligned_fasta


if __name__ == "__main__":
    cli()
