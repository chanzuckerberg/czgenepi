import json
from datetime import datetime
from typing import Iterable

import click
import sqlalchemy as sa
from sqlalchemy.orm import joinedload, undefer

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import (
    AlignedPathogenGenome,
    Group,
    Location,
    Pathogen,
    PathogenGenome,
    Sample,
    TreeType,
    UploadedPathogenGenome,
)
from aspen.workflows.nextstrain_run.build_config import TemplateBuilder
from aspen.workflows.nextstrain_run.export import (
    resolve_template_args,
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
    "--template-args",
    type=str,
    required=False,
    default="{}",
    help="Which existing group to use for this build?",
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
@click.option(
    "--sequence-type",
    type=click.Choice(["aligned", "uploaded"]),
    default="uploaded",
    required=True,
)
def cli(
    tree_type: str,
    sequences: int,
    selected: int,
    gisaid: int,
    template_args: str,
    group_name: str,
    location: str,
    pathogen: str,
    sequence_type: str,
):
    tree_types = {
        "overview": TreeType.OVERVIEW,
        "targeted": TreeType.TARGETED,
        "non_contextualized": TreeType.NON_CONTEXTUALIZED,
    }
    build_type = tree_types[tree_type]
    template_data = json.loads(template_args)
    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))

    sequences_fh = open("sequences.fasta", "w")
    metadata_fh = open("metadata.tsv", "w")
    selected_fh = open("include.txt", "w")
    builds_file_fh = open("nextstrain_build.yaml", "w")

    num_sequences = 0
    num_included_samples = 0

    with session_scope(interface) as session:
        pathogen_genomes = get_random_pathogen_genomes(
            session, sequences, sequence_type
        )

        num_sequences = write_sequences_files(
            session, sequence_type, pathogen_genomes, sequences_fh, metadata_fh
        )
        if build_type != TreeType.OVERVIEW:
            gisaid_ids = generate_test_gisaid_ids(gisaid)
            num_included_samples = write_includes_file(
                session,
                gisaid_ids,
                pathogen_genomes[:selected],
                selected_fh,
                sequence_type,
            )
        pathogen_model = (
            session.execute(sa.select(Pathogen).where(Pathogen.slug == pathogen))  # type: ignore
            .scalars()
            .one()
        )

        # Give the nextstrain config builder some info to make decisions
        context = {
            "num_sequences": num_sequences,
            "num_included_samples": num_included_samples,
            "run_start_datetime": datetime.now(),
        }
        group_query = sa.select(Group)  # type: ignore
        if group_name:
            group_query = group_query.filter(Group.name == group_name)  # type: ignore
        group = session.execute(group_query).scalars().first()
        if not group:
            raise Exception("No group found")

        resolved_template_args = resolve_template_args(
            session, pathogen_model, template_data, group
        )
        if location:
            (region, country, div, loc) = location.split("/")
            tree_location = Location(
                region=region, country=country, division=div, location=loc
            )
            group.default_tree_location = tree_location
            resolved_template_args["location"] = tree_location

        builder = TemplateBuilder(
            build_type, pathogen_model, group, resolved_template_args, **context
        )
        builder.write_file(builds_file_fh)

        print("Wrote output files!")
        for k, v in resolved_template_args.items():
            print(f"Resolved {k} to {v}")
        session.rollback()  # Don't save any changes to the DB.


def get_random_pathogen_genomes(session, max_genomes, sequence_type):
    sequence_model = UploadedPathogenGenome
    if sequence_type == "aligned":
        sequence_model = AlignedPathogenGenome
    all_genomes: Iterable[Sample] = (
        sa.select(sequence_model)  # type: ignore
        .options(
            joinedload(sequence_model.sample, innerjoin=True),
            undefer(PathogenGenome.sequence),
        )
        .limit(max_genomes)
    )
    pathogen_genomes = [item for item in session.execute(all_genomes).scalars()]
    return pathogen_genomes


def generate_test_gisaid_ids(max_ids):
    return [f"fake_gisaid_id{i}" for i in range(max_ids)]


if __name__ == "__main__":
    cli()
