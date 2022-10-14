import io
import subprocess
import urllib.request
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
from aspen.database.models import Sample


def check_latest_pangolin_version() -> str:
    contents = urllib.request.urlopen(
        "https://github.com/cov-lineages/pangoLEARN/releases/latest"
    )
    # get latest version from redirected url:
    redirected_url: str = contents.url
    latest_version: str = redirected_url.split("/")[-1]
    return latest_version


def find_samples() -> Iterable[str]:
    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))
    most_recent_pango_version: str = check_latest_pangolin_version()

    with session_scope(interface) as session:
        # filter for sequences that were run with an older version of pangolin

        all_samples: Iterable[Sample] = session.query(Sample).options(
            joinedload(Sample.uploaded_pathogen_genome)
        )

        # TODO: update this comparison to be <= most_recent_pango_version
        # once we update this field to be a date instead of string

        samples_to_be_updated: Iterable[str] = [
            sample.public_identifier
            for sample in all_samples
            if (
                sample.uploaded_pathogen_genome is not None
                and sample.uploaded_pathogen_genome.pangolin_version
                != most_recent_pango_version
            )
        ]

        return samples_to_be_updated


@click.command("find_samples")
@click.option("samples_fh", "--output-file", type=click.File("w"), required=True)
@click.option("--test", type=bool, is_flag=True)
def run_command(samples_fh: io.TextIOBase, test: bool):
    if test:
        print("Success!")
        return
    samples = find_samples()
    for sample_id in samples:
        samples_fh.write(f"{sample_id}\n")
    print(f"{len(samples)} sample ids dumped to {samples_fh.name}")


if __name__ == "__main__":
    run_command()
