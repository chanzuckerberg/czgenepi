from sqlalchemy import Column, DateTime, String

from aspen.database.models import base


class GisaidMetadata(base):
    """Nightly snapshot of gisaid metadata"""

    __tablename__ = "gisaid_metadata"

    strain = Column(String, primary_key=True)
    pango_lineage = Column(String, nullable=True)
    gisaid_clade = Column(String, nullable=True)
    date = Column(DateTime, nullable=True)
    region = Column(
        String, nullable=True
    )  # Can be a value outside our RegionTable enum
    division = Column(String, nullable=True)
    location = Column(String, nullable=True)
