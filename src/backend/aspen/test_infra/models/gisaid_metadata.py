from datetime import datetime

from aspen.database.models import GisaidMetadata


def gisaid_metadata_factory(
    strain="gisaid_identifier/hCoV-19",
    pango_lineage="B.1.617.2",
    gisaid_clade="T",  # T for test
    date=None,
    region="North America",  # Not necessarily in our Sample/RegionType enum
    division="California",
    location="Alameda County",
) -> GisaidMetadata:
    date = date or datetime.now()
    return GisaidMetadata(
        strain=strain,
        pango_lineage=pango_lineage,
        gisaid_clade=gisaid_clade,
        date=date,
        region=region,
        division=division,
        location=location,
    )
