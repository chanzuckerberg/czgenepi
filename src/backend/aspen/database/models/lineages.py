import enum

import enumtables
from sqlalchemy import (
    Column,
    DateTime,
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
    """All tools/types of lineages used to associate samples with lineages."""

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
    last_updated = Column(DateTime, nullable=True)

    # For Nextclade, we need to track the underlying reference data bundle
    # that was involved to know how the lineage call was made.
    # TODO FIXME: Lots of table/row duplication here. _Probably_ better to
    # normalize it as a single entry somewhere and then reference that.
    # Evaluate later -- because of how we use this, not hard to change later.
    # Search this to find all instances: §NextcladeTagDuplicationTODO
    reference_dataset_name = Column(String, nullable=True)
    reference_sequence_accession = Column(String, nullable=True)
    reference_dataset_tag = Column(String, nullable=True)


class QCMetricCaller(enum.Enum):
    """All the tools/ways we use to call the QC info over all pathogens.

    Right now we only have one, but over time we think it's likely we'll want
    to support multiple different tools/ways to get the QC info on a sample
    and that a sample could have multiple different QCs associated with it,
    one for each of the various tools that can run on that pathogen type."""

    NEXTCLADE = "NEXTCLADE"


_QCMetricCallerTable = enumtables.EnumTable(
    QCMetricCaller, base, tablename="qc_metric_callers"
)


class SampleQCMetric(idbase):  # type: ignore
    __tablename__ = "sample_qc_metrics"
    __table_args__ = (
        UniqueConstraint(
            "sample_id",
            "qc_caller",
        ),
    )

    sample_id = Column(Integer, ForeignKey("samples.id"), nullable=False, unique=True)
    sample = relationship("Sample", back_populates="qc_metrics")  # type: ignore
    # What tool/method was used to produce this object of QC metrics.
    qc_caller = Column(
        Enum(QCMetricCaller),
        ForeignKey(_QCMetricCallerTable.item_id),
        nullable=False,
    )
    # If a QC call comes back invalid for a sample, `qc_score` is set to NULL
    qc_score = Column(String, nullable=True)
    qc_software_version = Column(String, nullable=False)
    qc_status = Column(String, nullable=False)
    raw_qc_output = Column(JSONB, nullable=True)

    # For Nextclade, we need to track the underlying reference data bundle
    # that was involved to know how the QC score was made.
    # TODO FIXME: Lots of table/row duplication here. _Probably_ better to
    # normalize it as a single entry somewhere and then reference that.
    # Evaluate later -- because of how we use this, not hard to change later.
    # Search this to find all instances: §NextcladeTagDuplicationTODO
    reference_dataset_name = Column(String, nullable=True)
    reference_sequence_accession = Column(String, nullable=True)
    reference_dataset_tag = Column(String, nullable=True)
