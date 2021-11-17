from sqlalchemy import Column, DateTime, String

from aspen.database.models.base import base
from aspen.database.models.mixins import DictMixin


class GisaidMetadata(base, DictMixin):  # type: ignore
    """Nightly snapshot of gisaid metadata"""

    __tablename__ = "gisaid_metadata"

    strain = Column(String, primary_key=True)
    pango_lineage = Column(String, nullable=True)
    gisaid_clade = Column(String, nullable=True)
    gisaid_epi_isl = Column(String, nullable=True)
    date = Column(DateTime, nullable=True)
    region = Column(
        String, nullable=True
    )  # Can be a value outside our RegionTable enum
    country = Column(String, nullable=True)
    division = Column(String, nullable=True)
    location = Column(String, nullable=True)
