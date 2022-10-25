import datetime
import io
import json
from typing import IO, MutableSequence, Set

import click
from sqlalchemy.orm import joinedload

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import (
    PathogenGenome,
    PhyloRun,
    PhyloTree,
    Sample,
    UploadedPathogenGenome,
)
from aspen.database.models.workflow import SoftwareNames, WorkflowStatusType
from aspen.phylo_tree.identifiers import get_names_from_tree


@click.command("save")
@click.option("--aspen-workflow-rev", type=str, required=True)
@click.option("--aspen-creation-rev", type=str, required=True)
@click.option("--ncov-rev", type=str, required=True)
@click.option("--aspen-docker-image-version", type=str, required=True)
@click.option("--end-time", type=int, required=True)
@click.option("--phylo-run-id", type=int, required=True)
@click.option("--bucket", type=str, required=True)
@click.option("--key", type=str, required=True)
@click.option(
    "resolved_template_args_fh",
    "--resolved-template-args",
    type=click.File("r", lazy=True),
    required=True,
    help="JSON file containing resolved template args from setup process",
)
@click.option("--tree-path", type=click.File("r"), required=True)
@click.option("--test", type=bool, is_flag=True)
def cli(
    aspen_workflow_rev: str,
    aspen_creation_rev: str,
    ncov_rev: str,
    aspen_docker_image_version: str,
    end_time: int,
    phylo_run_id: int,
    bucket: str,
    key: str,
    resolved_template_args_fh: IO[str],
    tree_path: io.TextIOBase,
    test: bool,
):
    if test:
        print("Success!")
        return

    end_time_datetime = datetime.datetime.fromtimestamp(end_time)
    # TODO Add below to resulting PhyloTree once model/DB updated.
    # resolved_template_args = json.load(resolved_template_args_fh)

    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))
    with session_scope(interface) as session:
        phylo_run: PhyloRun = (
            session.query(PhyloRun)
            .filter(PhyloRun.workflow_id == phylo_run_id)
            .options(
                joinedload(PhyloRun.pathogen),
                joinedload(PhyloRun.inputs.of_type(UploadedPathogenGenome))
                # load the sample that this uploaded pathogen genome was associated with
                .subqueryload(UploadedPathogenGenome.sample),
            )
            .one()
        )

        assert phylo_run.workflow_status != WorkflowStatusType.COMPLETED

        # read the tree
        tree_json = json.load(tree_path)
        all_public_identifiers = get_names_from_tree([tree_json["tree"]])

        # get all the children that are pathogen genomes
        pathogen_genomes = [
            inp for inp in phylo_run.inputs if isinstance(inp, PathogenGenome)
        ]

        uploaded_pathogen_genomes: Set[UploadedPathogenGenome] = {
            pathogen_genome
            for pathogen_genome in pathogen_genomes
            if isinstance(pathogen_genome, UploadedPathogenGenome)
        }

        included_samples: MutableSequence[Sample] = list()
        for uploaded_pathogen_genome in uploaded_pathogen_genomes:
            if (
                uploaded_pathogen_genome.sample.public_identifier.replace(
                    "hCoV-19/", ""
                )
                in all_public_identifiers
            ):
                included_samples.append(uploaded_pathogen_genome.sample)

        # create an output
        phylo_tree = PhyloTree(
            s3_bucket=bucket,
            s3_key=key,
            constituent_samples=included_samples,
            name=phylo_run.name,
            group=phylo_run.group,
            tree_type=phylo_run.tree_type,
            pathogen=phylo_run.pathogen,
        )

        # update the run object with the metadata about the run.
        phylo_run.end_datetime = end_time_datetime
        phylo_run.workflow_status = WorkflowStatusType.COMPLETED
        phylo_run.software_versions = {
            SoftwareNames.ASPEN_WORKFLOW: aspen_workflow_rev,
            SoftwareNames.ASPEN_CREATION: aspen_creation_rev,
            SoftwareNames.NCOV: ncov_rev,
            SoftwareNames.ASPEN_DOCKER_IMAGE: aspen_docker_image_version,
        }
        phylo_run.outputs = [phylo_tree]


if __name__ == "__main__":
    cli()
