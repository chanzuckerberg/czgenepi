from sqlalchemy import Column, String

from aspen.database.models.base import idbase


class PangoLineage(idbase):  # type: ignore
    """A Pango lineage. Only real data is its official name (`lineage`).

    Entire table taken together should be all the current Pango lineages.
    This table gets regularly updated by a data workflow.
    See workflow named `import_pango_lineages` for that process.

    Intent of this table and the workflow is to duplicate info at
    https://raw.githubusercontent.com/cov-lineages/pango-designation/master/lineage_notes.txt
    According to Pangolin team, that is the best indication of current list
    ^^^ Source: https://github.com/cov-lineages/pango-designation/issues/456
    """

    __tablename__ = "pango_lineages"

    lineage = Column(String, nullable=False, unique=True)

    def __repr__(self):
        return f"Pango Lineage <{self.lineage}>"
