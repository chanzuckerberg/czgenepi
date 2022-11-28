from aspen.database.models import Pathogen, PathogenLineage
from aspen.database.models import SampleLineage, LineageType


def pathogen_lineage_factory(lineage: str, pathogen: Pathogen):
    return PathogenLineage(lineage=lineage, pathogen=pathogen)


def sample_lineage_factory(
    sample, 
    lineage_type=LineageType.NEXTCLADE, 
    lineage_software_version="1.0.0", 
    lineage="B.1.1", 
    lineage_probability=None, 
    raw_lineage_output={}):
    return SampleLineage(
        sample=sample,
        lineage_type=lineage_type,
        lineage_software_version=lineage_software_version,
        lineage=lineage,
        lineage_probability=lineage_probability,
        raw_lineage_output=raw_lineage_output
    )
