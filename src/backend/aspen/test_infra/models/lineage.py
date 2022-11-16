from aspen.database.models import Pathogen, PathogenLineage


def pathogen_lineage_factory(lineage: str, pathogen: Pathogen):
    return PathogenLineage(lineage=lineage, pathogen=pathogen)
