from datetime import datetime

from aspen.database.models import GisaidMetadata


def gisaid_metadata_factory(
    strain="gisaid_identifier/hCoV-19",
    pango_lineage="B.1.617.2",
    gisaid_clade="T",  # T for test
    gisaid_epi_isl="EPI_ISL_8675309",
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
        gisaid_epi_isl=gisaid_epi_isl,
        date=date,
        region=region,
        division=division,
        location=location,
    )
