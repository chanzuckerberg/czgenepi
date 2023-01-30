import datetime

from aspen.database.models import AlignedPathogenGenome, Sample, UploadedPathogenGenome
from aspen.test_infra.models.sample import sample_factory


def uploaded_pathogen_genome_factory(
    sample,
    sequence=">test1\nNTCGGCG",
    num_unambiguous_sites=1,
    num_missing_alleles=0,
    num_mixed=0,
    sequencing_depth=0.1,
    sequencing_date=datetime.date.today(),
    upload_date=datetime.datetime.now(),
):
    uploaded_pathogen_genome = UploadedPathogenGenome(
        sample=sample,
        sequence=sequence,
        num_unambiguous_sites=num_unambiguous_sites,
        num_missing_alleles=num_missing_alleles,
        num_mixed=num_mixed,
        sequencing_depth=sequencing_depth,
        sequencing_date=sequencing_date,
        upload_date=upload_date,
    )

    return uploaded_pathogen_genome


def uploaded_pathogen_genome_multifactory(
    group, pathogen, uploaded_by_user, location, num_genomes
):
    pathogen_genomes = []
    for i in range(num_genomes):
        sample: Sample = sample_factory(
            group,
            uploaded_by_user,
            location,
            pathogen=pathogen,
            private_identifier=f"private_identifier_{i}",
            public_identifier=f"public_identifier_{i}",
        )
        pathogen_genome: UploadedPathogenGenome = uploaded_pathogen_genome_factory(
            sample,
        )
        pathogen_genomes.append(pathogen_genome)
    return pathogen_genomes


def aligned_pathogen_genome_factory(
    sample,
    sequence=">test1\nNTCGGCG",
    reference_name="ref_name",
    aligned_date=datetime.datetime.now(),
):
    aligned_pathogen_genome = AlignedPathogenGenome(
        sample=sample,
        sequence=sequence,
        reference_name=reference_name,
        aligned_date=aligned_date,
    )

    return aligned_pathogen_genome


def aligned_pathogen_genome_multifactory(
    group, pathogen, uploaded_by_user, location, num_genomes
):
    pathogen_genomes = []
    for i in range(num_genomes):
        sample: Sample = sample_factory(
            group,
            uploaded_by_user,
            location,
            pathogen=pathogen,
            private_identifier=f"private_identifier_{i}",
            public_identifier=f"public_identifier_{i}",
        )
        pathogen_genome: AlignedPathogenGenome = aligned_pathogen_genome_factory(
            sample,
        )
        pathogen_genomes.append(pathogen_genome)
    return pathogen_genomes
