"""
Writes out a FASTA for the sample PK ids specified by file.

Core approach here is a copy of what's in workflows/pangolin/export.py.
"""
import io
import json
from enum import Enum
from pathlib import Path
from typing import Dict, IO, Iterable, Optional
import subprocess
import sys

import click
import sqlalchemy as sa
from sqlalchemy.orm import joinedload
from sqlalchemy.orm.session import Session

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import Pathogen, Sample, SampleQCMetric, UploadedPathogenGenome, QCMetricCaller
from aspen.workflows.nextclade.utils import extract_dataset_info


# Running this CLI script must be one of these types of runs.
class RunType(str, Enum):  # str mix-in gives nice == compare against strings
    # [default] Make calls against samples specified by id via sample-ids-file
    SPECIFIED_IDS_ONLY = "specified-ids-only"
    # Get samples for pathogen with a stale call or no call, run against those
    REFRESH_STALE = "refresh-stale"
    # Call against all samples for pathogen, regardless of current state
    # No immediate purpose, here in case we need it in the future.
    FORCE_ALL = "force-all"
# `click` barfs on enums, so make a string list for it
_run_type_click_choices = [item.value for item in RunType]


@click.command("export")
@click.option("run_type", "--run-type", type=click.Choice(_run_type_click_choices), default=RunType.SPECIFIED_IDS_ONLY)
@click.option("pathogen_slug", "--pathogen-slug", type=str, required=True)
@click.option("sample_ids_fh", "--sample-ids-file", type=click.File("r"), required=True)
@click.option("sequences_fh", "--sequences", type=click.File("w"), required=True)
@click.option("nextclade_dataset_dir", "--nextclade-dataset-dir", type=click.Path(dir_okay=True, exists=False), required=True)
@click.option("nextclade_tag_filename", "--nextclade-tag-filename", type=str, required=True)
@click.option(
    "job_info_fh", "--job-info-file", type=click.File("w"), required=True
)
def cli(
    run_type: str,
    pathogen_slug: str,
    sample_ids_fh: io.TextIOBase,
    sequences_fh: io.TextIOBase,
    nextclade_dataset_dir: str,
    nextclade_tag_filename: str,
    job_info_fh: IO[str],
):
    """
    Writes out a FASTA for the specified samples.

    - run_type: What kind of run this is. Look above at `RunType` for info.
    - pathogen_slug: Pathogen.slug for pathogen we are running Nextclade on
    - sample_ids_fh: A file of sample ID primary keys, one ID per line.
        Each sample must be for the same pathogen (all SARS-CoV-2, etc)
        and match against whatever `pathogen_slug` is.
    - sequences_fh: Output file to write FASTA for above samples.
        NOTE Resulting FASTA will have its id lines (>) be those primary keys,
        so anything that consumes these downstream results will be referring
        to samples by PK, not by private/public identifier.
    - nextclade_dataset_dir: Dir to save the Nextclade dataset we download.
    - nextclade_tag_filename: Name of file that Nextclade uses to tag datasets.
    - job_info_fh: Write out info about job for later use in workflow

    TODO (Vince): It would be nice if this process batched up pulling the FASTA
    data over the samples. As it is, if a lot of samples need running, it just
    grabs all the sequence data in one big go and writes it to a very large
    FASTA. We haven't seen this approach cause issues so far -- it's how the
    Pangolin job has been doing it when refreshing stale samples -- but it
    could cause troubles as our sample count continues to grow and/or we are
    dealing with much larger genomes. Long-term, it might be better to grab
    chunks of samples from the DB, like 1k-10k at a time, so we don't have a
    single, huge query result coming in from the DB.
    """
    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))
    with session_scope(interface) as session:
        print(f"Getting pathogen data for {pathogen_slug}")
        target_pathogen_query: Pathogen = sa.select(Pathogen).filter(
            Pathogen.slug == pathogen_slug
        )
        target_pathogen: Pathogen = session.execute(target_pathogen_query).scalars().one()

        # This downloads the dataset info to disk for later use by nextclade.
        # VOODOO TODO turn this back on, just want to avoid pointless download
        # nextclade_dataset_info = download_nextclade_dataset(
        #     target_pathogen.nextclade_dataset_name,
        #     nextclade_dataset_dir,
        #     nextclade_tag_filename,
        #     )
        nextclade_dataset_info = {'name': 'hMPXV', 'accession': 'NC_063383.1', 'tag': '2022-11-03T12:00:00Z'}

        # Figure out which samples we need to run Nextclade on
        sample_ids: list[int] = []
        if run_type == RunType.SPECIFIED_IDS_ONLY:
            # In case of "empty" sample IDs file, it still contains a newline
            # because of how we build file. Easiest way to handle empty case
            # is to just ignore lines of only "\n" newline.
            sample_ids = [int(id_line) for id_line in sample_ids_fh if id_line != "\n"]
        elif run_type == RunType.REFRESH_STALE:
            sample_ids = get_sample_ids_to_refresh(
                session,
                target_pathogen,
                nextclade_dataset_info["name"],
                nextclade_dataset_info["accession"],
                nextclade_dataset_info["tag"],
            )
        elif run_type == RunType.FORCE_ALL:
            sample_ids = get_all_sample_ids_for_pathogen(
                session,
                target_pathogen,
            )

        # We should abandon this workflow run if there are no samples to run.
        if sample_ids == []:
            if run_type == RunType.REFRESH_STALE:
                print("No samples were found that needed refreshing.")
                save_job_info(job_info_fh, should_exit_because_no_samples=True)
                sys.exit()
            else:
                print("No samples for Nextclade run! Aborting workflow!")
                print(f"For RunType `{run_type}` this indicates usage error.")
                print("Please investigate why no samples were found.")
                raise RuntimeError("No samples for Nextclade run")

        print(f"{'=' * 30} BEGIN DEBUG PRINTING {'=' * 30}")  # REMOVE
        print('sample_ids')  # REMOVE
        print(sample_ids)  # REMOVE
        print('len(sample_ids)')  # REMOVE
        print(len(sample_ids))  # REMOVE
        print(f"{'=' * 30}  END DEBUG PRINTING  {'=' * 30}")  # REMOVE

        save_job_info(
            job_info_fh,
            pathogen_slug=target_pathogen.slug,
            nextclade_dataset_name=target_pathogen.nextclade_dataset_name,
            )

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


def download_nextclade_dataset(dataset_name: str, output_dir: str, tag_filename: str) -> Dict[str, str]:
    """Downloads most recent Nextclade dataset, returns important tag info.

    We determine the staleness of previous Nextclade calls by comparing those
    previous calls against the most recent tag info. If they do not match,
    we need to run Nextclade again to bring the call up to date.

    As part of this, we download the Nextclade dataset. This is where the
    dataset download happens for the overall process. We could do it in the
    shell script, but since the tag info is necessary for other steps, we
    pull the whole thing now.

    Note: we could instead use a different Nextclade CLI call
        nextclade dataset list --name DATASET_NAME_HERE --json
    to fetch just the tag info, **however** the structure of that JSON is
    different than the structure of the `tag.json` file. It seemed better
    to me (Vince) to have one, consistent way to pull tag info than needing
    to maintain two sources of truth. The overall bundle download is not
    very large and we do go on to use it if there's any calls to make, so
    that seemed reasonable to me. But if downloading here causes problems,
    try switching to just fetching the tag JSON and parsing it.
    """
    print(f"Downloading nextclade reference dataset with name {dataset_name}.")
    subprocess.run(
        ['nextclade', 'dataset', 'get', '--name', dataset_name, '--output-dir', output_dir],
        timeout=60,  # Just in case the call hangs, blow up everything
        check=True,  # Raise and blow up everything if non-zero exit code
        )

    with open(Path(output_dir, tag_filename)) as tag_fh:
        return extract_dataset_info(tag_fh)


def get_sample_ids_to_refresh(
    session: Session,
    target_pathogen: Pathogen,
    latest_dataset_name: str,
    latest_sequence_accession: str,
    latest_dataset_tag: str,
) -> list[int]:
    """Determine which sample_ids need to have their Nextclade call refreshed.

    The intent of this is to identify all samples of a given pathogen where:
        A) The sample has never had a qc_metric (model: SampleQCMetric) called
        against it, and thus needs to be called.
            -- OR --
        B) The sample has had a qc_metric called against it, but the underlying
        dataset that was used for the call is stale (e.g., tag does not match
        latest tag, etc). Two additional notes:
            B.1: We are only concerned with qc_metrics that used Nextclade as
            the calling tool. We'll need to figure out how to handle multiple
            calling tools down the road once/if we support that.
            B.2: Any Nextclade-called qc_metric **should** have name/accession/
            tag, but it's possible for a bug or future change to accidentally
            break this assumption and leave those cols as NULL. In that case,
            we should consider the qc_metric stale and refresh the sample.
    """
    # The outer join here lets us also filter on samples with no qc_metric
    refresh_samples_q = sa.select(Sample).join(Sample.qc_metrics, isouter=True).filter(
        Sample.pathogen_id == target_pathogen.id,
        sa.or_(
            # B/c outer join, if no qc_metric, then no values, so id is NULL
            SampleQCMetric.id == None,
            sa.and_(
                SampleQCMetric.qc_caller == QCMetricCaller.NEXTCLADE,
                sa.or_(
                    # The dual comparisons against not being the given value or
                    # being None/NULL is due to the fact that SQL comparisons
                    # ignore NULL when comparing values. If we want to check
                    # against NULL as well, we have to explicitly check both.
                    SampleQCMetric.reference_dataset_name != latest_dataset_name,
                    SampleQCMetric.reference_dataset_name == None,
                    SampleQCMetric.reference_sequence_accession != latest_sequence_accession,
                    SampleQCMetric.reference_sequence_accession == None,
                    SampleQCMetric.reference_dataset_tag != latest_dataset_tag,
                    SampleQCMetric.reference_dataset_tag == None,
                )
            )
        )
    )
    samples_to_refresh: list[Sample] = session.execute(refresh_samples_q).unique().scalars()
    return [sample.id for sample in samples_to_refresh]


def get_all_sample_ids_for_pathogen(
    session: Session,
    target_pathogen: Pathogen,
) -> list[int]:
    """Gets all the sample_ids for given pathogen.

    Intent here is to have an easy way to pull all the samples for a pathogen
    when it's a RunType.FORCE_ALL.
    """
    all_samples_for_pathogen_q = sa.select(Sample).filter(
        Sample.pathogen_id == target_pathogen.id)
    all_samples_for_pathogen: list[Sample] = session.execute(all_samples_for_pathogen_q).scalars()
    return [sample.id for sample in all_samples_for_pathogen]


def save_job_info(
    job_info_fh: IO[str],
    pathogen_slug: Optional[str] = None,
    should_exit_because_no_samples: bool = False,
    ):
    """Write a JSON of important info about job for use later in workflow.

    Job info file can be used to signal we can stop workflow early. In that
    case, the job info will not necessarily be complete with all values, but
    that's okay, because we'll never get to a place where we need those.
    """
    job_info = {
        "pathogen_slug": pathogen_slug,
        # Possible for everything to be working as expected, but there's no
        # need to keep running workflow because no samples need to be run.
        "should_exit_because_no_samples": should_exit_because_no_samples,
    }
    json.dump(job_info, job_info_fh)


if __name__ == "__main__":
    cli()
