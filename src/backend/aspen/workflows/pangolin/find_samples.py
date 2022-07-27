import re
import subprocess
from re import Match
from typing import Iterable, List, Optional

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

VERSION_REGEX = re.compile(r"[0-9.]+$")


def same_pangolin_version(sample_version_string: str, pangolin_version_string: str):
    sample_version_match: Optional[Match] = VERSION_REGEX.search(sample_version_string)
    pangolin_version_match: Optional[Match] = VERSION_REGEX.search(
        pangolin_version_string
    )
    if not sample_version_match or not pangolin_version_match:
        raise ValueError(
            f"No version number found in one of {sample_version_string}, {pangolin_version_string}"
        )
    return sample_version_match.group(0) == pangolin_version_match.group(0)


def find_samples(pangolin_version: str) -> List[str]:
    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))

    with session_scope(interface) as session:
        # filter for sequences that were run with an older version of pangolin

        all_samples: Iterable[Sample] = session.query(Sample).options(
            joinedload(Sample.uploaded_pathogen_genome)
        )

        # version comparisons are a nightmare, just check if they differ

        samples_to_be_updated: List[str] = [
            sample.public_identifier
            for sample in all_samples
            if (
                sample.uploaded_pathogen_genome is not None
                and not same_pangolin_version(
                    sample.uploaded_pathogen_genome.pangolin_version, pangolin_version
                )
            )
        ]

        return samples_to_be_updated


@click.command("find_samples")
@click.option("--test", type=bool, is_flag=True)
@click.option("--pangolin-version", type=str, required=True)
def run_command(test: bool, pangolin_version: str):
    if test:
        print("Success!")
        return
    samples = find_samples(pangolin_version)
    subprocess.run(["bash", "run_pangolin.sh"] + samples)


if __name__ == "__main__":
    run_command()
