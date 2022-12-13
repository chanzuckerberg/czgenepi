import csv
import io
import json
from typing import Dict, IO, Optional

import click
import sqlalchemy as sa

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import (
    LineageType,
    MutationsCaller,
    QCMetricCaller,
    Sample,
    SampleLineage,
    SampleMutation,
    SampleQCMetric,
)

# TODO, create an enum table for below and standard nextclade QC overallStatus
INVALID_RESULT_STATUS = "invalid"

FAILED_LINEAGE_STATUS = "FAILED"


@click.command("save")
@click.option("nextclade_fh", "--nextclade-csv", type=click.File("r"), required=True)
@click.option(
    "nextclade_tag_fh", "--nextclade-dataset-tag", type=click.File("r"), required=True
)
@click.option("nextclade_version", "--nextclade-version", type=str, required=True)
@click.option("pathogen_slug", "--pathogen-slug", type=str, required=True)
def cli(
    nextclade_fh: io.TextIOBase,
    nextclade_tag_fh: IO[str],
    nextclade_version: str,
    pathogen_slug: str,
):
    """Go through results from nextclade run, save to DB for each sample."""
    # Track info about the dataset that was used to produce results being saved
    dataset_info = extract_dataset_info(nextclade_tag_fh)

    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))
    with session_scope(interface) as session:
        nextclade_csv: csv.DictReader = csv.DictReader(nextclade_fh, delimiter=";")
        for row in nextclade_csv:
            # For entire workflow, we use sample id primary keys for names.
            sample_id = int(row["seqName"])
            sample_q = sa.select(Sample).where(Sample.id == sample_id)
            sample = session.execute(sample_q).scalars().one()

            is_result_valid = is_nextclade_result_valid(row)
            # We always record QC info for any sample run, even if invalid.
            qc_score: Optional[str] = row["qc.overallScore"]
            qc_status = row["qc.overallStatus"]
            if not is_result_valid:
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

        # TODO: commit session after 1000 entries to limit transaction size


def extract_dataset_info(nextclade_tag_fh: IO[str]) -> Dict[str, str]:
    """Extracts important info from `tag.json` file of a nextclade dataset.

    A Nextclade dataset provides a `tag.json` file with various pieces of info
    on that specific dataset bundle.
    https://docs.nextstrain.org/projects/nextclade/en/stable/user/datasets.html
    We want to persist certain key pieces of info because they let us know the
    provenance of a lineage/QC/mutations call when using Nextclade.

    Those pieces of info are
        - name: The Nextclade name for the dataset bundle, eg "sars-cov-2"
            (Note, a given pathogen can have multiple of these with different
            meaning. For example, "sars-cov-2-no-recomb" also pertains to the
            same pathogen, but focuses the dataset on different aspects.)
        - accession: The underlying reference genome's id, eg "MN908947"
        - tag: The version of overall dataset bundle, eg "2022-11-15T12:00:00Z"
    """
    nextclade_tag = json.load(nextclade_tag_fh)
    return {
        "name": nextclade_tag["name"],
        "accession": nextclade_tag["reference"]["accession"],
        "tag": nextclade_tag["tag"],
    }


def is_nextclade_result_valid(nextclade_csv_row: Dict[str, str]) -> bool:
    """Not all sequences succeed in run. Results with errors should be ignored.

    When running Nextclade, sequences can fail for various reasons. If a
    sequence fails, it will either have associated `errors` or `warnings`.
    Those are present in the general results file, and also duplicated to
    their own special error file (nextclade.errors.csv). If anything shows up
    for either of those, consider the sequence invalid. We should record that
    its QC came back as invalid, but do not record mutations or lineages.

    There is also a `failedGenes` field: it's currently an open Comp Bio
    question if we need to do anything based on that being populated, or if
    it's okay to just ignore it. Right now it seems like it's fine to ignore
    for our use-case, but that might change in the future."""
    if nextclade_csv_row["errors"] == "" and nextclade_csv_row["warnings"] == "":
        return True
    return False


def get_lineage_from_row(nextclade_csv_row: Dict[str, str], is_result_valid: bool) -> str:
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


if __name__ == "__main__":
    cli()
