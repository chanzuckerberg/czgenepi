import json
from typing import Any, Dict, Iterable

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
from aspen.database.models import Group, Location, PathogenGenome, Sample, TreeType, Pathogen
from aspen.workflows.nextstrain_run.build_config import TemplateBuilder
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
@click.option(
    "--sequences",
    type=int,
    required=False,
    default=10,
    help="How many overall group sequences in this build",
)
@click.option(
    "--selected",
    type=int,
    required=False,
    default=10,
    help="How many of the overall group sequences should be selected in include.txt",
)
@click.option(
    "--gisaid",
    type=int,
    required=False,
    default=10,
    help="How many GISAID ID's to include in the build",
)
@click.option(
    "--group-name",
    type=str,
    required=False,
    default=None,
    help="Which existing group to use for this build?",
)
@click.option(
    "--location",
    type=str,
    required=False,
    default=None,
    help="Location for tree build in region/country/div/loc format. Country example: 'North America/Mexico//'",
)
@click.option(
    "--pathogen",
    type=str,
    required=False,
    default="SC2",
    help="Pathogen to build a tree for",
)
def cli(
    tree_type: str,
    sequences: int,
    selected: int,
    gisaid: int,
    group_name: str,
    location: str,
    pathogen: str,
):
    tree_types = {
        "overview": TreeType.OVERVIEW,
        "targeted": TreeType.TARGETED,
        "non_contextualized": TreeType.NON_CONTEXTUALIZED,
    }
    build_type = tree_types[tree_type]
    template_args: Dict[str, Any] = {}
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
        if build_type != TreeType.OVERVIEW:
            gisaid_ids = generate_test_gisaid_ids(gisaid)
            num_included_samples = write_includes_file(
                session, gisaid_ids, pathogen_genomes[:selected], selected_fh
            )
        pathogen_model = session.execute(sa.select(Pathogen).where(Pathogen.slug == pathogen)).scalars().one()

        # Give the nextstrain config builder some info to make decisions
        context = {
            "num_sequences": num_sequences,
            "num_included_samples": num_included_samples,
        }
        group_query = sa.select(Group)  # type: ignore
        if group_name:
            group_query = group_query.filter(Group.name == group_name)  # type: ignore
        group = session.execute(group_query).scalars().first()
        if not group:
            raise Exception("No group found")
        if location:
            (region, country, div, loc) = location.split("/")
            tree_location = Location(
                region=region, country=country, division=div, location=loc
            )
            group.default_tree_location = tree_location
        builder = TemplateBuilder(build_type, pathogen_model, group, template_args, **context)
        builder.write_file(builds_file_fh)

        print("Wrote output files!")
        print(json.dumps(context))
        session.rollback()  # Don't save any changes to the DB.


def get_random_pathogen_genomes(session, max_genomes):
    all_samples: Iterable[Sample] = (
        sa.select(Sample)  # type: ignore
        .options(
            joinedload(Sample.uploaded_pathogen_genome, innerjoin=True).undefer(
                PathogenGenome.sequence
            )
        )
        .limit(max_genomes)
    )
    pathogen_genomes = [
        sample.uploaded_pathogen_genome
        for sample in session.execute(all_samples).scalars()
    ]
    return pathogen_genomes


def generate_test_gisaid_ids(max_ids):
    return [f"fake_gisaid_id{i}" for i in range(max_ids)]


if __name__ == "__main__":
    cli()
