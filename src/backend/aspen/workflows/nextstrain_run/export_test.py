import json
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
from aspen.database.models import Group, PathogenGenome, Sample, TreeType
from aspen.workflows.nextstrain_run.build_config import builder_factory
from aspen.workflows.nextstrain_run.export import (
    write_includes_file,
    write_sequences_files,
)


@click.command("save")
@click.option(
    "--tree-type",
    type=click.Choice(["overview", "targeted", "non_contextualized"]),
    required=True,
)
@click.option("--sequences", type=int, required=False, default=10)
@click.option("--selected", type=int, required=False, default=10)
@click.option("--gisaid", type=int, required=False, default=10)
def cli(
    tree_type: str,
    sequences: int,
    selected: int,
    gisaid: int,
):
    tree_types = {
        "overview": TreeType.OVERVIEW,
        "targeted": TreeType.TARGETED,
        "non_contextualized": TreeType.NON_CONTEXTUALIZED,
    }
    tree_type = tree_types[tree_type]
    template_args = {}
    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))

    sequences_fh = open("sequences.fasta", "w")
    metadata_fh = open("metadata.tsv", "w")
    selected_fh = open("include.txt", "w")
    builds_file_fh = open("nextstrain_build.yaml", "w")

    num_sequences = 0
    num_included_samples = 0

    with session_scope(interface) as session:
        pathogen_genomes = get_random_pathogen_genomes(session, sequences)

        num_sequences = write_sequences_files(
            session, pathogen_genomes, sequences_fh, metadata_fh
        )
        if tree_type != TreeType.OVERVIEW:
            gisaid_ids = generate_test_gisaid_ids(gisaid)
            num_included_samples = write_includes_file(
                session, gisaid_ids, pathogen_genomes[:selected], selected_fh
            )

        # Give the nextstrain config builder some info to make decisions
        context = {
            "num_sequences": num_sequences,
            "num_included_samples": num_included_samples,
        }
        group = session.query(Group).first()
        builder = builder_factory(tree_type, group, template_args, **context)
        builder.write_file(builds_file_fh)

        print("Wrote output files!")
        print(json.dumps(context))


def get_random_pathogen_genomes(session, max_genomes):
    all_samples: Iterable[Sample] = (
        session.query(Sample)
        .options(
            joinedload(Sample.uploaded_pathogen_genome, innerjoin=True).undefer(
                PathogenGenome.sequence
            )
        )
        .limit(max_genomes)
    )
    pathogen_genomes = [sample.uploaded_pathogen_genome for sample in all_samples]
    return pathogen_genomes


def generate_test_gisaid_ids(max_ids):
    return [f"fake_gisaid_id{i}" for i in range(max_ids)]


if __name__ == "__main__":
    cli()
