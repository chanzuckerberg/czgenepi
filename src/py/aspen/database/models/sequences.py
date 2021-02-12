import enum

import enumtables
from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import backref, relationship

from .base import base
from .entity import Entity, EntityType
from .enum import Enum
from .physical_sample import PhysicalSample


class SequencingInstrumentType(enum.Enum):
    ILLUMINA_HISEQ_X = "Illumina HiSeq X"
    ILLUMINA_HISEQ_X_FIVE = "Illumina HiSeq X Five"
    ILLUMINA_HISEQ_X_TEN = "Illumina HiSeq X Ten"
    ILLUMINA_GENOME_ANALYZER = "Illumina Genome Analyzer"
    ILLUMINA_GENOME_ANALYZER_II = "Illumina Genome Analyzer II"
    ILLUMINA_GENOME_ANALYZER_IIX = "Illumina Genome Analyzer IIx"
    ILLUMINA_HISCANSQ = "Illumina HiScanSQ"
    ILLUMINA_HISEQ_1000 = "Illumina HiSeq 1000"
    ILLUMINA_HISEQ_1500 = "Illumina HiSeq 1500"
    ILLUMINA_HISEQ_2000 = "Illumina HiSeq 2000"
    ILLUMINA_HISEQ_2500 = "Illumina HiSeq 2500"
    ILLUMINA_HISEQ_3000 = "Illumina HiSeq 3000"
    ILLUMINA_HISEQ_4000 = "Illumina HiSeq 4000"
    ILLUMINA_ISEQ_100 = "Illumina iSeq 100"
    ILLUMINA_NOVASEQ_6000 = "Illumina NovaSeq 6000"
    ILLUMINA_MINISEQ = "Illumina MiniSeq"
    ILLUMINA_MISEQ = "Illumina MiSeq"
    ILLUMINA_NEXTSEQ_500 = "Illumina NextSeq 500"
    ILLUMINA_NEXTSEQ_550 = "Illumina NextSeq 550"
    PACBIO_RS = "PacBio RS"
    PACBIO_RS_II = "PacBio RS II"
    PACBIO_SEQUEL = "PacBio Sequel"
    PACBIO_SEQUEL_II = "PacBio Sequel II"
    ION_TORRENT_PGM = "Ion Torrent PGM"
    ION_TORRENT_PROTON = "Ion Torrent Proton"
    ION_TORRENT_S5_XL = "Ion Torrent S5 XL"
    ION_TORRENT_S5 = "Ion Torrent S5"
    OXFORD_NANOPORE_GRIDION = "Oxford Nanopore GridION"
    OXFORD_NANOPORE_MINION = "Oxford Nanopore MinION"
    OXFORD_NANOPORE_PROMETHION = "Oxford Nanopore PromethION"
    BGISEQ_500 = "BGISEQ-500"
    DNBSEQ_T7 = "DNBSEQ-T7"
    DNBSEQ_G400 = "DNBSEQ-G400"
    DNBSEQ_G400_FAST = "DNBSEQ-G400 FAST"
    DNBSEQ_G50 = "DNBSEQ-G50"
    NOT_APPLICABLE = "Not Applicable"
    NOT_COLLECTED = "Not Collected"
    NOT_PROVIDED = "Not Provided"
    MISSING = "Missing"
    RESTRICTED_ACCESS = "Restricted Access"


# Create the enumeration table
# Pass your enum class and the SQLAlchemy declarative base to enumtables.EnumTable
_SequencingInstrumentTypeTable = enumtables.EnumTable(
    SequencingInstrumentType,
    base,
    tablename="sequencing_instrument_types",
)


class SequencingProtocolType(enum.Enum):
    ARTIC_V3 = "artic_v3"


# Create the enumeration table
# Pass your enum class and the SQLAlchemy declarative base to enumtables.EnumTable
_SequencingProtocolTypeTable = enumtables.EnumTable(
    SequencingProtocolType,
    base,
    tablename="sequencing_protocol_types",
)


class SequencingReads(Entity):
    __tablename__ = "sequencing_reads"
    __table_args__ = (UniqueConstraint("s3_bucket", "s3_key"),)
    __mapper_args__ = {"polymorphic_identity": EntityType.SEQUENCING_READS}

    entity_id = Column(Integer, ForeignKey(Entity.id), primary_key=True)
    physical_sample_id = Column(Integer, ForeignKey(PhysicalSample.id), nullable=False)
    physical_sample = relationship(PhysicalSample, backref=backref("sequencing_reads"))

    sequencing_instrument = Column(
        Enum(SequencingInstrumentType),
        ForeignKey(_SequencingInstrumentTypeTable.item_id),
        nullable=False,
    )
    sequencing_protocol = Column(
        Enum(SequencingProtocolType),
        ForeignKey(_SequencingProtocolTypeTable.item_id),
        nullable=False,
    )

    s3_bucket = Column(String, nullable=False)
    s3_key = Column(String, nullable=False)

    sequencing_date = Column(DateTime)


class PathogenGenome(Entity):
    __tablename__ = "pathogen_genomes"

    entity_id = Column(Integer, ForeignKey(Entity.id), primary_key=True)
    sequence = Column(String, nullable=False)

    # statistics for the pathogen genome

    # Number of sites with allele A, C, T, or G
    num_unambiguous_sites = Column(Integer, nullable=False)

    # Number of sites with N, the missing allele, typically indicating
    # low depth
    num_n = Column(Integer, nullable=False)

    # Number of sites with an ambiguous allele, e.g. M, K, Y,etc.,
    # indicating support for 2 or more alleles in the reads.
    num_mixed = Column(Integer, nullable=False)


class UploadedPathogenGenome(PathogenGenome):
    __tablename__ = "uploaded_pathogen_genomes"
    __mapper_args__ = {"polymorphic_identity": EntityType.UPLOADED_PATHOGEN_GENOME}

    pathogen_genome_id = Column(
        Integer, ForeignKey(PathogenGenome.entity_id), primary_key=True
    )
    physical_sample_id = Column(Integer, ForeignKey(PhysicalSample.id), nullable=False)
    physical_sample = relationship(
        PhysicalSample, backref=backref("uploaded_pathogen_genome")
    )

    sequencing_depth = Column(Float)


class CalledPathogenGenome(PathogenGenome):
    __tablename__ = "called_pathogen_genomes"
    __mapper_args__ = {"polymorphic_identity": EntityType.CALLED_PATHOGEN_GENOME}

    pathogen_genome_id = Column(
        Integer, ForeignKey(PathogenGenome.entity_id), primary_key=True
    )
