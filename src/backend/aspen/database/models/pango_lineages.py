from sqlalchemy import Column, String

from aspen.database.models.base import idbase


class PangoLineages(idbase):
    """TODO docme"""
    __tablename__ = "pango_lineages"

    lineage = Column(String, nullable=False, unique=True)
