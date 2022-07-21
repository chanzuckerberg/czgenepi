from aspen.database.models import PangoLineage


def pango_lineage_factory(lineage: str):
    return PangoLineage(lineage=lineage)
