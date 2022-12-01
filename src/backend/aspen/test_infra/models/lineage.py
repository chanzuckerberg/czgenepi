from aspen.database.models import LineageType, Pathogen, PathogenLineage, SampleLineage


def pathogen_lineage_factory(lineage: str, pathogen: Pathogen):
    return PathogenLineage(lineage=lineage, pathogen=pathogen)


def sample_lineage_factory(
    sample,
    lineage_type=LineageType.NEXTCLADE,
    lineage_software_version="1.0.0",
    lineage="B.1.1",
    lineage_probability=None,
    raw_lineage_output={},
    reference_dataset_name="",
    reference_sequence_accession="",
    reference_dataset_tag="",
):
    return SampleLineage(
        sample=sample,
        lineage_type=lineage_type,
        lineage_software_version=lineage_software_version,
        lineage=lineage,
        lineage_probability=lineage_probability,
        raw_lineage_output=raw_lineage_output,
        reference_dataset_name=reference_dataset_name,
        reference_sequence_accession=reference_sequence_accession,
        reference_dataset_tag=reference_dataset_tag,
    )
