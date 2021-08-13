from sqlalchemy import Column, String, DateTime
from aspen.database.models.base import base
from typing import Mapping

class GisaidMetadata(base):
    """Nightly snapshot of gisaid metadata"""
    __tablename__ = "gisaid_metadata"

    strain = Column(String, primary_key=True)
    pango_lineage = Column(String, nullable=True)
    gisaid_clade = Column(String, nullable=True)
    date = Column(DateTime, nullable=True)
    region = Column(String, nullable=True)
    division = Column(String, nullable=True)
    location = Column(String, nullable=True)
    import_id = Column(String, nullable=True)
