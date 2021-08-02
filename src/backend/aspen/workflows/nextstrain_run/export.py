import csv
import io
import json
from pathlib import Path
from typing import Any, Mapping, MutableMapping, Set, Tuple

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
    Bam,
    CalledPathogenGenome,
    Entity,
    EntityType,
    HostFilteredSequencingReadsCollection,
    PathogenGenome,
    PhyloRun,
    PublicRepositoryType,
    Sample,
    SequencingReadsCollection,
    UploadedPathogenGenome,
)
from aspen.database.models.workflow import Workflow

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
@click.option("sequences_fh", "--sequences", type=click.File("w"), required=True)
@click.option("metadata_fh", "--metadata", type=click.File("w"), required=True)
@click.option("builds_file_fh", "--builds-file", type=click.File("w"), required=True)
@click.option("county_sequences_fh", "--county-sequences", type=click.File("w"), required=False)
@click.option("county_metadata_fh", "--county-metadata", type=click.File("w"), required=False)
def cli(
    phylo_run_id: int,
    sequences_fh: io.TextIOBase,
    metadata_fh: io.TextIOBase,
    builds_file_fh: io.TextIOBase,
    county_sequences_fh: io.TextIOBase,
    county_metadata_fh: io.TextIOBase,
):
    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))

    with session_scope(interface) as session:
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
                joinedload(PhyloRun.inputs.of_type(phylo_run_inputs)).undefer(
                    phylo_run_inputs.PathogenGenome.sequence
                )
            )
            .one()
        )

        # Net new stuff we're working on TODO
        if county_sequences_fh:
            # Get all samples for the group
            group = phylo_run.group
            all_samples: Iterable[Sample] = (
                session.query(Sample)
                .filter(
                    Sample.submitting_group_id == group.id
                )
                .options(
                    joinedload(Sample.uploaded_pathogen_genome, innerjoin=True).undefer(
                        PathogenGenome.sequence)
                )
            )
            pathogen_genomes = [ sample.uploaded_pathogen_genome for sample in all_samples ]
            # Write all those samples to the sequences/metadata files
            import pdb
            pdb.set_trace()
            do_smart_things_with_pathogen_list(session, pathogen_genomes, county_sequences_fh, county_metadata_fh)

            # Success!

        # Populate builds.yaml file with values from the phylo_run template_args
        # and write them to the filesystem
        aspen_root = Path(__file__).parent.parent.parent.parent.parent
        with (aspen_root / phylo_run.template_file_path).open("r") as build_template_fh:
            build_template = build_template_fh.read()
        template_args = (
            phylo_run.template_args
            if isinstance(phylo_run.template_args, Mapping)
            else {}
        )
        print(template_args)
        builds_file_fh.write(build_template.format(**template_args))

        # get all the children that are pathogen genomes
        pathogen_genomes = [
            inp for inp in phylo_run.inputs if isinstance(inp, PathogenGenome)
        ]
        # get the aligned gisaid run info.
        aligned_gisaid = [
            inp for inp in phylo_run.inputs if isinstance(inp, AlignedGisaidDump)
        ][0]

        do_smart_things_with_pathogen_list(session, pathogen_genomes, sequences_fh, metadata_fh)

        print(
            json.dumps(
                {
                    "bucket": aligned_gisaid.s3_bucket,
                    "metadata_key": aligned_gisaid.metadata_s3_key,
                    "sequences_key": aligned_gisaid.sequences_s3_key,
                }
            )
        )

def do_smart_things_with_pathogen_list(session, pathogen_genomes, sequences_fh, metadata_fh):
    # Create a list of the inputted pathogen genomes that are uploaded pathogen genomes
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
                    {
                        pathogen_genome.entity_id
                        for pathogen_genome in pathogen_genomes
                    }
                ),
            )
        )
    }

    aspen_samples: Set[str] = set()
    metadata_csv_fh = csv.DictWriter(
        metadata_fh, METADATA_CSV_FIELDS, delimiter="\t"
    )
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
        }

        metadata_csv_fh.writerow(aspen_metadata_row)
        sequences_fh.write(f">{sample.public_identifier}\n")
        sequences_fh.write(sequence)
        sequences_fh.write("\n")

if __name__ == "__main__":
    cli()
