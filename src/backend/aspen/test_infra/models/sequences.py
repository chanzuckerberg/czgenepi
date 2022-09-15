import datetime

from aspen.database.models import Sample, UploadedPathogenGenome
from aspen.test_infra.models.sample import sample_factory


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
    pangolin_output={},
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
        pangolin_output=pangolin_output,
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
            pangolin_lineage=None,
            pangolin_probability=None,
            pangolin_version=None,
            pangolin_last_updated=None,
        )
        pathogen_genomes.append(pathogen_genome)
    return pathogen_genomes
