import datetime
from typing import Sequence

from aspen.database.models import (
    PublicRepositoryType,
    PublicRepositoryTypeMetadata,
    Sample,
    SequencingInstrumentType,
    SequencingProtocolType,
    SequencingReadsCollection,
    UploadedPathogenGenome,
    WorkflowStatusType,
)
from aspen.test_infra.models.accession_workflow import AccessionWorkflowDirective
from aspen.test_infra.models.sample import sample_factory


def sequencing_read_factory(
    sample: Sample,
    sequencing_instrument=SequencingInstrumentType.ILLUMINA_GENOME_ANALYZER_IIX,
    sequencing_protocol=SequencingProtocolType.ARTIC_V3,
    sequencing_date=None,
    s3_bucket="bucket",
    s3_key="key",
    consuming_workflows=[],
) -> SequencingReadsCollection:
    sequencing_date = sequencing_date or datetime.datetime.now()
    sequencing_reads = SequencingReadsCollection(
        sample=sample,
        sequencing_instrument=sequencing_instrument,
        sequencing_protocol=sequencing_protocol,
        sequencing_date=sequencing_date,
        s3_bucket=s3_bucket,
        s3_key=s3_key,
        consuming_workflows=consuming_workflows,
    )
    return sequencing_reads


def uploaded_pathogen_genome_factory(
    sample,
    sequence=">test1\nNTCGGCG",
    num_unambiguous_sites=1,
    num_missing_alleles=0,
    num_mixed=0,
    pangolin_lineage="B.1.590",
    pangolin_probability=1.0,
    pangolin_version="2021-04-23",
    pangolin_last_updated=datetime.datetime.now(),
    sequencing_depth=0.1,
    sequencing_date=datetime.date.today(),
    upload_date=datetime.datetime.now(),
    accessions: Sequence[AccessionWorkflowDirective] = (
        AccessionWorkflowDirective(
            PublicRepositoryType.GISAID,
            datetime.datetime.now(),
            datetime.datetime.now(),
            "gisaid_public_identifier",
        ),
    ),
):
    uploaded_pathogen_genome = UploadedPathogenGenome(
        sample=sample,
        sequence=sequence,
        num_unambiguous_sites=num_unambiguous_sites,
        num_missing_alleles=num_missing_alleles,
        num_mixed=num_mixed,
        pangolin_lineage=pangolin_lineage,
        pangolin_probability=pangolin_probability,
        pangolin_version=pangolin_version,
        pangolin_last_updated=pangolin_last_updated,
        sequencing_depth=sequencing_depth,
        sequencing_date=sequencing_date,
        upload_date=upload_date,
    )
    for accession_workflow_directive in accessions:
        if accession_workflow_directive.end_datetime is None:
            public_repository_metadata: PublicRepositoryTypeMetadata = (
                accession_workflow_directive.repository_type.value
            )
            uploaded_pathogen_genome.consuming_workflows.append(
                public_repository_metadata.accession_workflow_cls(
                    software_versions={},
                    workflow_status=WorkflowStatusType.FAILED,
                    start_datetime=accession_workflow_directive.start_datetime,
                )
            )
        else:
            assert accession_workflow_directive.repository_type is not None
            assert accession_workflow_directive.public_identifier is not None
            uploaded_pathogen_genome.add_accession(
                repository_type=accession_workflow_directive.repository_type,
                public_identifier=accession_workflow_directive.public_identifier,
                workflow_start_datetime=accession_workflow_directive.start_datetime,
                workflow_end_datetime=accession_workflow_directive.end_datetime,
            )

    return uploaded_pathogen_genome


def uploaded_pathogen_genome_multifactory(
    group, uploaded_by_user, location, num_genomes
):
    pathogen_genomes = []
    for i in range(num_genomes):
        sample: Sample = sample_factory(
            group,
            uploaded_by_user,
            location,
            private_identifier=f"private_identifier_{i}",
            public_identifier=f"public_identifier_{i}",
        )
        pathogen_genome: UploadedPathogenGenome = uploaded_pathogen_genome_factory(
            sample,
            accessions=(),
            pangolin_lineage=None,
            pangolin_probability=None,
            pangolin_version=None,
            pangolin_last_updated=None,
        )
        pathogen_genomes.append(pathogen_genome)
    return pathogen_genomes
