import csv
import io
import json
from typing import Any, Iterable, List, Mapping, MutableMapping, Set, Tuple

import click
from sqlalchemy import and_
from sqlalchemy.orm import aliased, joinedload, with_polymorphic

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import (
    AlignedGisaidDump,
    Entity,
    EntityType,
    Group,
    PathogenGenome,
    PhyloRun,
    PublicRepositoryType,
    Sample,
    TreeType,
    UploadedPathogenGenome,
)
from aspen.database.models.workflow import Workflow
from aspen.workflows.nextstrain_run.build_config import builder_factory
from aspen.workflows.nextstrain_run.builder_base import BaseNextstrainConfigBuilder

METADATA_CSV_FIELDS = [
    "strain",
    "virus",
    "gisaid_epi_isl",
    "genbank_accession",
    "date",
    "region",
    "country",
    "division",
    "location",
    "region_exposure",
    "country_exposure",
    "division_exposure",
    "segment",
    "length",
    "host",
    "age",
    "sex",
    "pango_lineage",
    "GISAID_clade",
    "originating_lab",
    "submitting_lab",
    "authors",
    "url",
    "title",
    "paper_url",
    "date_submitted",
]


@click.command("save")
@click.option("--phylo-run-id", type=int, required=True)
@click.option("sequences_fh", "--sequences", type=click.File("w"), required=False)
@click.option(
    "selected_fh", "--selected", type=click.File("w", lazy=False), required=True
)
@click.option("metadata_fh", "--metadata", type=click.File("w"), required=True)
@click.option("builds_file_fh", "--builds-file", type=click.File("w"), required=True)
@click.option("--test", type=bool, is_flag=True)
def cli(
    phylo_run_id: int,
    sequences_fh: io.TextIOBase,
    selected_fh: io.TextIOBase,
    metadata_fh: io.TextIOBase,
    builds_file_fh: io.TextIOBase,
    test: bool,
):
    if test:
        print("Success!")
        return
    aligned_gisaid_dump = export_run_config(
        phylo_run_id, sequences_fh, selected_fh, metadata_fh, builds_file_fh
    )
    print(json.dumps(aligned_gisaid_dump))


def export_run_config(
    phylo_run_id: int,
    sequences_fh: io.TextIOBase,
    selected_fh: io.TextIOBase,
    metadata_fh: io.TextIOBase,
    builds_file_fh: io.TextIOBase,
):
    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))

    num_sequences: int = 0
    num_included_samples: int = 0

    with session_scope(interface) as session:
        phylo_run = get_phylo_run(session, phylo_run_id)
        group: Group = phylo_run.group

        # Fetch all of a group's samples.
        county_samples: List[PathogenGenome] = get_county_samples(session, group)

        # get the aligned gisaid run info.
        aligned_gisaid: AlignedGisaidDump = [
            inp for inp in phylo_run.inputs if isinstance(inp, AlignedGisaidDump)
        ][0]

        num_sequences = write_sequences_files(
            session, county_samples, sequences_fh, metadata_fh
        )

        # Write include.txt file(s) for targeted/non_contextualized builds.
        if phylo_run.tree_type != TreeType.OVERVIEW:
            selected_samples: List[PathogenGenome] = [
                inp for inp in phylo_run.inputs if isinstance(inp, PathogenGenome)
            ]
            num_included_samples = write_includes_file(
                session, phylo_run.gisaid_ids, selected_samples, selected_fh
            )

        # Give the nexstrain config builder some info to make decisions
        context = {
            "num_sequences": num_sequences,
            "num_included_samples": num_included_samples,
        }
        builder: BaseNextstrainConfigBuilder = builder_factory(
            phylo_run.tree_type, group, phylo_run.template_args, **context
        )
        builder.write_file(builds_file_fh)

        return {
            "bucket": aligned_gisaid.s3_bucket,
            "metadata_key": aligned_gisaid.metadata_s3_key,
            "sequences_key": aligned_gisaid.sequences_s3_key,
        }


def get_county_samples(session, group: Group):
    # Get all samples for the group
    all_samples: Iterable[Sample] = (
        session.query(Sample)
        .filter(Sample.submitting_group_id == group.id)
        .options(
            joinedload(Sample.uploaded_pathogen_genome, innerjoin=True).undefer(
                PathogenGenome.sequence
            )
        )
    )
    pathogen_genomes = [sample.uploaded_pathogen_genome for sample in all_samples]
    return pathogen_genomes


def get_phylo_run(session, phylo_run_id):
    # this allows us to load the secondary tables of a polymorphic type.  In this
    # case, we want to load the inputs of a phylo run, provided the input is of type
    # `PathogenGenome` and `AlignedGisaidDump`.
    phylo_run_inputs = with_polymorphic(
        Entity,
        [PathogenGenome, AlignedGisaidDump],
        flat=True,
    )
    phylo_run: PhyloRun = (
        session.query(PhyloRun)
        .filter(PhyloRun.workflow_id == phylo_run_id)
        .options(
            joinedload(PhyloRun.group),
            joinedload(PhyloRun.inputs.of_type(phylo_run_inputs)).undefer(
                phylo_run_inputs.PathogenGenome.sequence
            ),
        )
        .one()
    )
    return phylo_run


def write_includes_file(session, gisaid_ids, pathogen_genomes, selected_fh):
    # Create a list of the inputted pathogen genomes that are uploaded pathogen genomes
    num_includes = 0
    sample_ids: List[int] = [
        pathogen_genome.sample_id
        for pathogen_genome in pathogen_genomes
        if isinstance(pathogen_genome, UploadedPathogenGenome)
    ]

    # Write an includes.txt with the sample ID's.
    sample_query = session.query(Sample).filter(Sample.id.in_(sample_ids))
    for sample in sample_query:
        public_identifier = sample.public_identifier
        if public_identifier.lower().startswith("hcov-19"):
            public_identifier = public_identifier[8:]
        selected_fh.write(f"{public_identifier}\n")
        num_includes += 1
    for gisaid_id in gisaid_ids:
        # remove leading hcov-19/ preceding characters, ignore case
        gisaid_id = re.sub(r'^hcov-19\/', "", gisaid_id, flags=re.I)
        selected_fh.write(f"{gisaid_id}\n")
        num_includes += 1
    return num_includes


def write_sequences_files(session, pathogen_genomes, sequences_fh, metadata_fh):
    # Create a list of the inputted pathogen genomes that are uploaded pathogen genomes
    num_sequences = 0
    uploaded_pathogen_genomes = {
        pathogen_genome
        for pathogen_genome in pathogen_genomes
        if isinstance(pathogen_genome, UploadedPathogenGenome)
    }

    sample_ids = {
        uploaded_pathogen_genome.sample_id
        for uploaded_pathogen_genome in uploaded_pathogen_genomes
    }

    sample_id_to_sample: Mapping[int, Sample] = {
        sample.id: sample
        for sample in session.query(Sample).filter(Sample.id.in_(sample_ids))
    }
    accession_input_alias = aliased(Entity)
    pathogen_genome_id_repository_type_to_accession_names: Mapping[
        Tuple[int, PublicRepositoryType], str
    ] = {
        (
            accession.get_parents(PathogenGenome)[0].entity_id,
            PublicRepositoryType.from_entity_type(accession.entity_type),
        ): accession.public_identifier
        # We have overlap between aligned gisaid file & aspen data.
        for accession in session.query(Entity)
        .join(Entity.producing_workflow)
        .join(accession_input_alias, Workflow.inputs)
        .filter(
            and_(
                Entity.entity_type.in_(
                    (
                        EntityType.GISAID_REPOSITORY_SUBMISSION,
                        EntityType.GENBANK_REPOSITORY_SUBMISSION,
                    )
                ),
                accession_input_alias.id.in_(
                    {pathogen_genome.entity_id for pathogen_genome in pathogen_genomes}
                ),
            )
        )
    }

    aspen_samples: Set[str] = set()
    metadata_csv_fh = csv.DictWriter(metadata_fh, METADATA_CSV_FIELDS, delimiter="\t")
    metadata_csv_fh.writeheader()
    for pathogen_genome in pathogen_genomes:
        # find the corresponding sample
        if isinstance(pathogen_genome, UploadedPathogenGenome):
            sample_id = pathogen_genome.sample_id
        else:
            raise ValueError("pathogen genome of unknown type")
        sample = sample_id_to_sample[sample_id]
        aspen_samples.add(sample.public_identifier)

        sequence = "".join(
            [
                line
                for line in pathogen_genome.sequence.splitlines()
                if not (line.startswith(">") or line.startswith(";"))
            ]
        )
        sequence = sequence.strip("Nn")

        upload_date = None
        if sample.sequencing_reads_collection is not None:
            upload_date = sample.sequencing_reads_collection.upload_date.strftime(
                "%Y-%m-%d"
            )
        elif sample.uploaded_pathogen_genome is not None:
            upload_date = sample.uploaded_pathogen_genome.upload_date.strftime(
                "%Y-%m-%d"
            )

        aspen_metadata_row: MutableMapping[str, Any] = {
            "strain": sample.public_identifier,
            "virus": "ncov",
            "gisaid_epi_isl": pathogen_genome_id_repository_type_to_accession_names.get(
                (pathogen_genome.entity_id, PublicRepositoryType.GISAID), ""
            ),
            "genbank_accession": pathogen_genome_id_repository_type_to_accession_names.get(
                (pathogen_genome.entity_id, PublicRepositoryType.GENBANK), ""
            ),
            "date": sample.collection_date.strftime("%Y-%m-%d"),
            "date_submitted": upload_date,
            "region": sample.region.value,
            "country": sample.country,
            "division": sample.division,
            "location": sample.location,
            "region_exposure": sample.region.value,
            "country_exposure": sample.country,
            "division_exposure": sample.division,
            "segment": "genome",
            "length": len(sequence),
            "host": "Human",
            "age": "?",
            "sex": "?",
            "originating_lab": sample.sample_collected_by,
            "submitting_lab": sample.submitting_group.name,
            "authors": ", ".join(sample.authors),
            "pango_lineage": sample.uploaded_pathogen_genome.pangolin_lineage,
        }

        metadata_csv_fh.writerow(aspen_metadata_row)
        sequences_fh.write(f">{sample.public_identifier}\n")
        sequences_fh.write(sequence)
        sequences_fh.write("\n")
        num_sequences += 1
    return num_sequences


if __name__ == "__main__":
    cli()
