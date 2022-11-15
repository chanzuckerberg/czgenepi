import csv
import io
import json
import re
from typing import Any, Dict, IO, Iterable, List, Mapping, MutableMapping, Optional, Set

import click
import sqlalchemy as sa
from sqlalchemy.orm import aliased, joinedload, with_polymorphic

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    Session,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import (
    Accession,
    AccessionType,
    AlignedRepositoryData,
    Entity,
    Group,
    Location,
    PangoLineage,
    PathogenGenome,
    PhyloRun,
    Sample,
    UploadedPathogenGenome,
)
from aspen.database.models.workflow import WorkflowStatusType
from aspen.util.lineage import expand_lineage_wildcards
from aspen.workflows.nextstrain_run.build_config import TemplateBuilder

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
@click.option(
    "resolved_template_args_fh",
    "--resolved-template-args",
    type=click.File("w"),
    required=True,
)
@click.option("builds_file_fh", "--builds-file", type=click.File("w"), required=True)
@click.option(
    "--reset-status",
    type=bool,
    is_flag=True,
    help="Should the status of this workflow be set to 'STARTED'?",
)
@click.option("--test", type=bool, is_flag=True)
@click.option("--builds-file-only", type=bool, is_flag=True)
def cli(
    phylo_run_id: int,
    sequences_fh: io.TextIOWrapper,
    selected_fh: io.TextIOWrapper,
    metadata_fh: io.TextIOWrapper,
    builds_file_fh: io.TextIOWrapper,
    resolved_template_args_fh: IO[str],
    reset_status: bool,
    test: bool,
    builds_file_only: bool,
):
    if builds_file_only:
        dump_yaml_template(phylo_run_id, builds_file_fh)
        return
    if test:
        print("Success!")
        return
    aligned_repo_data = export_run_config(
        phylo_run_id,
        sequences_fh,
        selected_fh,
        metadata_fh,
        resolved_template_args_fh,
        builds_file_fh,
        reset_status,
    )
    print(json.dumps(aligned_repo_data))


# For local debugging of our yaml building process.
def dump_yaml_template(
    phylo_run_id: int,
    builds_file_fh: io.TextIOWrapper,
):
    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))

    num_sequences: int = 0
    num_included_samples: int = 0

    with session_scope(interface) as session:
        phylo_run = get_phylo_run(session, phylo_run_id)
        group: Group = phylo_run.group

        # Give the nexstrain config builder some info to make decisions
        context = {
            "num_sequences": num_sequences,
            "num_included_samples": num_included_samples,
        }
        builder: TemplateBuilder = TemplateBuilder(
            phylo_run.tree_type, group, phylo_run.template_args, **context
        )
        builder.write_file(builds_file_fh)

        print(f"YAML Build Config dumped to {builds_file_fh.name}")


def export_run_config(
    phylo_run_id: int,
    sequences_fh: io.TextIOBase,
    selected_fh: io.TextIOBase,
    metadata_fh: io.TextIOBase,
    resolved_template_args_fh: IO[str],
    builds_file_fh: io.TextIOBase,
    reset_status: bool = False,
):
    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))

    num_sequences: int = 0
    num_included_samples: int = 0

    with session_scope(interface) as session:
        phylo_run = get_phylo_run(session, phylo_run_id)

        if reset_status:
            phylo_run.workflow_status = WorkflowStatusType.STARTED
            session.commit()
        group: Group = phylo_run.group

        # Fetch all of a group's samples.
        county_samples: List[PathogenGenome] = get_county_samples(session, group)

        # get the aligned gisaid run info.
        aligned_gisaid: AlignedRepositoryData = [
            inp for inp in phylo_run.inputs if isinstance(inp, AlignedRepositoryData)
        ][0]

        num_sequences = write_sequences_files(
            session, county_samples, sequences_fh, metadata_fh
        )

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
            "run_start_datetime": phylo_run.start_datetime,  # can be None
        }

        # Some template args need to be resolved before ready to use.
        resolved_template_args = resolve_template_args(
            session, phylo_run.template_args, group
        )
        # Keep a record of what they resolved to. Make permanent in `save.py`
        save_resolved_template_args(resolved_template_args_fh, resolved_template_args)

        builder: TemplateBuilder = TemplateBuilder(
            phylo_run.tree_type,
            phylo_run.pathogen,
            group,
            resolved_template_args,
            **context,
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
    # `PathogenGenome` and `AlignedRepositoryData`.
    phylo_run_inputs = with_polymorphic(
        Entity,
        [PathogenGenome, AlignedRepositoryData],
        flat=True,
    )
    phylo_run: PhyloRun = (
        session.query(PhyloRun)
        .filter(PhyloRun.workflow_id == phylo_run_id)
        .options(
            joinedload(PhyloRun.pathogen),
            joinedload(PhyloRun.group),
            joinedload(PhyloRun.inputs.of_type(phylo_run_inputs)).undefer(
                phylo_run_inputs.PathogenGenome.sequence
            ),
        )
        .one()
    )
    return phylo_run


def resolve_filter_pango_lineages(
    session: Session, template_args: Dict[str, Any]
) -> Optional[List[str]]:
    """Takes raw lineage filter, expands it. Helper for `resolve_template_args`

    User can specify the lineages they want a tree build to filter on and are
    able to use wildcards and some other, non-pango lineages as part of that.
    Downstream needs Pango-only lineages. This handles using the originally
    provided `filter_pango_lineages` arg and converting it. If arg was not
    present in original template_args, returns None instead.
    """
    lineage_list = template_args.get("filter_pango_lineages")
    if lineage_list is None:  # short-circuit if template arg was not present
        return None
    all_lineages_query = sa.select(PangoLineage.lineage)
    # Utility that does expansion depends on having set of all lineages.
    all_lineages = set(session.execute(all_lineages_query).scalars().all())
    return expand_lineage_wildcards(all_lineages, lineage_list)


def resolve_template_args(
    session: Session, template_args: Dict[str, Any], group: Group
) -> Dict[str, Any]:
    """Takes raw template_args and interprets them so ready for downstream use.

    Some of the raw args from upstream (eg, `location_id`) need to be resolved
    into something usable downstream. There's no definite line between args
    that can stay "raw" and those that need to be interpreted. Generally, it's
    if it needs (A) to involve database usage or (B) to make a clearer version
    of the arg for eventual display to user (eg, in the trees table).
    """
    # We do not pass thru any template_args that get special interpretation
    NON_PASSTHRU_ARGS = ["location_id", "filter_pango_lineages"]

    # Handle location. If custom set, use that, otherwise use group's default.
    resolved_location = group.default_tree_location
    custom_location_id = template_args.get("location_id")
    if custom_location_id:
        resolved_location = (
            session.query(Location).filter(Location.id == custom_location_id).one()
        )

    resolved_filter_pango_lineages = resolve_filter_pango_lineages(
        session, template_args
    )

    # Avoid mutating original template_args; resolved args handled special.
    resolved_template_args = {
        key: template_args[key] for key in template_args if key not in NON_PASSTHRU_ARGS
    }
    resolved_template_args["location"] = resolved_location
    if resolved_filter_pango_lineages:  # only use lineages if we had any
        resolved_template_args["filter_pango_lineages"] = resolved_filter_pango_lineages

    return resolved_template_args


def save_resolved_template_args(
    resolved_template_args_fh: IO[str], resolved_template_args: Dict[str, Any]
):
    """Writes a JSON version of resolved template args to disk.

    Intent is that we want to keep a permanent record of what the template args
    resolved to as part of saving out a tree after its creation. Since save
    step happens in different script `save.py`, we write them to disk here,
    then that script loads them in before permamently recording that info."""
    # Some of the resolved args are not directly serializable (eg, objects).
    # We do special handling of them so we can serialize them to JSON.
    NON_SERIALIZABLE_ARGS = ["location"]
    json_ready_dict = {
        key: resolved_template_args[key]
        for key in resolved_template_args
        if key not in NON_SERIALIZABLE_ARGS
    }
    # `location` is a DB object, so we manually dump to dict before JSON output
    tree_location = resolved_template_args["location"]
    json_ready_dict["location"] = tree_location.to_dict()

    json.dump(json_ready_dict, resolved_template_args_fh)


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
        # remove leading hcov-19/ preceding characters, ignore case
        public_identifier = re.sub(r"^hcov-19\/", "", public_identifier, flags=re.I)
        selected_fh.write(f"{public_identifier}\n")
        num_includes += 1
    for gisaid_id in gisaid_ids:
        gisaid_id = re.sub(r"^hcov-19\/", "", gisaid_id, flags=re.I)
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
        for sample in session.query(Sample)
        .filter(Sample.id.in_(sample_ids))
        .options(joinedload(Sample.collection_location))
    }
    aliased(Entity)

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
        if sample.uploaded_pathogen_genome is not None:
            upload_date = sample.uploaded_pathogen_genome.upload_date.strftime(
                "%Y-%m-%d"
            )

        gisaid_accession: Optional[Accession] = None
        genbank_accession: Optional[Accession] = None
        for accession in sample.accessions:
            if accession.accession_type == AccessionType.GISAID_ISL:
                gisaid_accession = accession
            elif accession.accession_type == AccessionType.GENBANK:
                genbank_accession = accession

        aspen_metadata_row: MutableMapping[str, Any] = {
            "strain": sample.public_identifier,
            "virus": "ncov",
            "gisaid_epi_isl": getattr(gisaid_accession, "accession", None) or "",
            "genbank_accession": getattr(genbank_accession, "accession", None) or "",
            "date": sample.collection_date.strftime("%Y-%m-%d"),
            "date_submitted": upload_date,
            "region": sample.collection_location.region,
            "country": sample.collection_location.country,
            "division": sample.collection_location.division,
            "location": sample.collection_location.location,
            "region_exposure": sample.collection_location.region,
            "country_exposure": sample.collection_location.country,
            "division_exposure": sample.collection_location.division,
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
