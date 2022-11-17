import csv
import io
import json
from typing import Dict, IO

import click
import sqlalchemy as sa
from sqlalchemy.sql.expression import and_

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import (
    LineageType,
    Sample,
    SampleLineage,
    SampleMutation,
    SampleQCMetric,
)


@click.command("save")
@click.option("nextclade_fh", "--nextclade-csv", type=click.File("r"), required=True)
@click.option("nextclade_tag_fh", "--nextclade-dataset-tag", type=click.File("r"), required=True)
@click.option("nextclade_version", "--nextclade-version", type=str, required=True)
@click.option("pathogen_slug", "--pathogen-slug", type=str, required=True)
def cli(
    nextclade_fh: io.TextIOBase,
    nextclade_tag_fh: IO[str],
    nextclade_version: str,
    pathogen_slug: str,
):
    # TODO add this info into the various kinds of database rows
    # dataset_info = extract_dataset_info(nextclade_tag_fh)
    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))

    with session_scope(interface) as session:
        nextclade_csv: csv.DictReader = csv.DictReader(nextclade_fh, delimiter=";")
        for row in nextclade_csv:
            # For entire workflow, we use sample id primary keys for names.
            sample_id = int(row["seqName"])
            sample_q = sa.select(Sample).where(Sample.id == sample_id)
            sample = session.execute(sample_q).scalars().one()
            existing_qc_metric_q = (
                sa.select(SampleQCMetric)
                .join(SampleQCMetric.sample)
                .filter(SampleQCMetric.sample == sample)
            )
            qc_metric = session.execute(existing_qc_metric_q).scalars().one_or_none()

            if qc_metric is None:
                qc_metric = SampleQCMetric(
                    sample=sample,
                    qc_score=row["qc.overallScore"],
                    qc_status=row["qc.overallStatus"],
                    raw_qc_output={key: value for key, value in row.items()},
                    qc_software_version=nextclade_version,
                )
            else:
                qc_metric.qc_score = row["qc.overallScore"]
                qc_metric.qc_status = row["qc.overallStatus"]
                qc_metric.raw_qc_output = {key: value for key, value in row.items()}
                qc_metric.qc_software_version = nextclade_version

            session.add(qc_metric)

            existing_mutation_q = (
                sa.select(SampleMutation)
                .join(SampleMutation.sample)
                .filter(SampleMutation.sample == sample)
            )
            mutation = session.execute(existing_mutation_q).scalars().one_or_none()
            if mutation is None:
                mutation = SampleMutation(
                    sample=sample,
                    substitutions=row["substitutions"],
                    insertions=row["insertions"],
                    deletions=row["deletions"],
                    aa_substitutions=row["aaSubstitutions"],
                    aa_insertions=row["aaInsertions"],
                    aa_deletions=row["aaDeletions"],
                )
            else:
                mutation.substitutions = row["substitutions"]
                mutation.insertions = row["insertions"]
                mutation.deletions = row["deletions"]
                mutation.aa_substitutions = row["aaSubstitutions"]
                mutation.aa_insertions = row["aaInsertions"]
                mutation.aa_deletions = row["aaDeletions"]

            session.add(mutation)

            # if not SC2 proceed with filling lineage table with nextclade output
            if pathogen_slug != "SC2":
                existing_sample_lineage_q = (
                    sa.select(SampleLineage)
                    .join(SampleLineage.sample)
                    .filter(SampleLineage.sample == sample)
                )
                sample_lineage = (
                    session.execute(existing_sample_lineage_q).scalars().one_or_none()
                )
                LineageType.NEXTCLADE
                if sample_lineage is None:
                    sample_lineage = SampleLineage(
                        sample=sample,
                        lineage_type=LineageType.NEXTCLADE,
                        lineage_software_version=nextclade_version,
                        lineage=row["clade"],
                    )
                else:
                    sample_lineage.lineage_type = LineageType.NEXTCLADE
                    sample_lineage.lineage_software_version = nextclade_version
                    sample_lineage.lineage = row["clade"]
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


if __name__ == "__main__":
    cli()
