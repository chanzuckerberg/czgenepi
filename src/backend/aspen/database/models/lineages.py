import enum

import enumtables
from sqlalchemy import (
    Column,
    Float,
    ForeignKey,
    Integer,
    PrimaryKeyConstraint,
    String,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from aspen.database.models.base import base, idbase
from aspen.database.models.enum import Enum
from aspen.database.models.pathogens import Pathogen


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


class PathogenLineage(base):  # type: ignore
    """A pathogen lineage. Only real data is its official name (`lineage`).

    Entire table taken together should be all the current lineages for a pathogen.
    This table gets regularly updated by a data workflow.
    See workflow named `import_pango_lineages` for that process. # TODO - support more pathogens!

    Intent of this table and the workflow is to duplicate info at:
    - https://raw.githubusercontent.com/cov-lineages/pango-designation/master/lineage_notes.txt
    - https://github.com/mpxv-lineages/lineage-designation/blob/master/auto-generated/lineages.json
    According to Pangolin and NCBI teams, these is the best indication of current list

    Sources:
    - https://github.com/cov-lineages/pango-designation/issues/456
    """

    __tablename__ = "pathogen_lineages"
    __table_args__ = (
        PrimaryKeyConstraint(
            "pathogen_id",
            "lineage",
        ),
    )

    pathogen_id = Column(
        Integer, ForeignKey(Pathogen.id), nullable=False, primary_key=True
    )
    pathogen = relationship(Pathogen)  # type: ignore
    lineage = Column(String, nullable=False, primary_key=True)

    def __repr__(self):
        return f"Pathogen Lineage <{self.lineage}>"


class LineageType(enum.Enum):
    PANGOLIN = "PANGOLIN"
    NEXTCLADE = "NEXTCLADE"


_LineageTypeTable = enumtables.EnumTable(
    LineageType,
    base,
    tablename="lineage_types",
)


class SampleLineage(idbase):  # type: ignore
    __tablename__ = "sample_lineages"
    __table_args__ = (
        UniqueConstraint(
            "sample_id",
            "lineage_type",
        ),
    )

    sample_id = Column(Integer, ForeignKey("samples.id"))
    sample = relationship("Sample", back_populates="lineages")  # type: ignore
    lineage_type = Column(
        Enum(LineageType),
        ForeignKey(_LineageTypeTable.item_id),
        nullable=False,
    )
    lineage_software_version = Column(String, nullable=False)
    lineage = Column(String, nullable=False)
    lineage_probability = Column(Float, nullable=True)
    raw_lineage_output = Column(JSONB, nullable=True)


class SampleQCMetric(idbase):  # type: ignore
    __tablename__ = "sample_qc_metrics"

    sample_id = Column(Integer, ForeignKey("samples.id"), unique=True)
    sample = relationship("Sample", back_populates="qc_metrics")  # type: ignore
    qc_score = Column(String, nullable=False, unique=True)
    qc_software_version = Column(String, nullable=False)
    qc_status = Column(String, nullable=False)
    raw_qc_output = Column(JSONB, nullable=True)
