from sqlalchemy import Column, String

from aspen.database.models.base import idbase


class PangoLineages(idbase):  # type: ignore
    """List of Pango lineages.

    Should generally duplicate those present at
    https://raw.githubusercontent.com/cov-lineages/pango-designation/master/lineage_notes.txt
    According to Pangolin team, that is the best indication of current list
    ^^^ Source: https://github.com/cov-lineages/pango-designation/issues/456

    This table gets regularly updated by a data job.
    """

    __tablename__ = "pango_lineages"

    lineage = Column(String, nullable=False, unique=True)

    def __repr__(self):
        return f"Pango Lineage <{self.lineage}>"
