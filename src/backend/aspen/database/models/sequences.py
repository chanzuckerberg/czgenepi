from __future__ import annotations

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    func,
    Integer,
    String,
    text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import backref, deferred, relationship

from aspen.database.models.base import idbase
from aspen.database.models.entity import Entity, EntityType
from aspen.database.models.sample import Sample


class PathogenGenome(Entity):
    __tablename__ = "pathogen_genomes"

    entity_id = Column(Integer, ForeignKey(Entity.id), primary_key=True)
    sequence = deferred(Column(String, nullable=False), raiseload=True)

    # statistics for the pathogen genome
    def calculate_num_unambiguous_sites(self):
        return sum((1 for i in self.current_parameters["sequence"] if i in ("ACTGU")))

    num_unambiguous_sites = Column(
        Integer,
        nullable=False,
        default=calculate_num_unambiguous_sites,
        comment="Number of sites with allele A, C, T, U or G",
    )

    def calculate_num_missing_alleles(self):
        return sum((1 for i in self.current_parameters["sequence"] if i == "N"))

    num_missing_alleles = Column(
        Integer,
        nullable=False,
        default=calculate_num_missing_alleles,
        comment=(
            "Number of sites with N, the missing allele,"
            " typically indicating low depth"
        ),
    )

    def calculate_num_mixed(self):
        return sum(
            (1 for i in self.current_parameters["sequence"] if i not in ("ACTGUN-"))
        )

    num_mixed = Column(
        Integer,
        nullable=False,
        default=calculate_num_mixed,
        comment=(
            "Number of sites with an ambiguous allele, e.g. M, K, Y, etc.,"
            " indicating support for 2 or more alleles in the reads."
        ),
    )
    sequencing_date = Column(Date, nullable=True)
    # Store a map of the fields in this pango output file
    pangolin_output = Column(
        JSONB,
        nullable=True,
        default=text("'{}'::jsonb"),
        server_default=text("'{}'::jsonb"),
    )


class UploadedPathogenGenome(PathogenGenome):
    __tablename__ = "uploaded_pathogen_genomes"
    __mapper_args__ = {"polymorphic_identity": EntityType.UPLOADED_PATHOGEN_GENOME}

    pathogen_genome_id = Column(
        Integer, ForeignKey(PathogenGenome.entity_id), primary_key=True
    )
    sample_id = Column(Integer, ForeignKey(Sample.id), unique=True, nullable=False)
    # The default value of cascade is "save-update, merge", so if we want to enable "delete", we
    # need to include the other options as well to maintain backwards compatibility.
    sample = relationship(  # type: ignore
        Sample,
        backref=backref(
            "uploaded_pathogen_genome",
            uselist=False,
            cascade="delete, merge, save-update",
        ),
    )
    sequencing_depth = Column(Float)
    upload_date = Column(DateTime, nullable=False, server_default=func.now())

    def get_stripped_sequence(self) -> str:
        """Returns the "stripped" pathogen sequence (what we use in FASTAs).

        The underlying sequence data we retain in the DB is captured as the
        user gives it to us, including newlines and possibly extra comment/id
        lines (> or ; prefixed lines). It also may include "filler" characters
        (N or n) to pad out for missing/corrupted readings. In most cases, when
        we pull the sequence for a pathogen, we want it as a single line with
        the >/; lines and Nn characters stripped. This encapsulates that.

        NOTE that the `sequence` column currently will raise an error on load
        (`raiseload`) to prevent accidentally lazy loading it. If you need
        sequence data, you'll need to make sure the underlying query is
        eagerly fetching that data or calling this method will raise an error
        (just the same as trying to access `sequence` would in that case).
        """
        sequence: str = "".join(
            [
                line
                for line in self.sequence.splitlines()
                if not (line.startswith(">") or line.startswith(";"))
            ]
        )
        return sequence.strip("Nn")


class AlignedPathogenGenome(PathogenGenome):
    __tablename__ = "aligned_pathogen_genome"
    __mapper_args__ = {"polymorphic_identity": EntityType.ALIGNED_PATHOGEN_GENOME}

    pathogen_genome_id = Column(
        Integer, ForeignKey(PathogenGenome.entity_id), primary_key=True
    )

    sample_id = Column(Integer, ForeignKey(Sample.id), unique=True, nullable=False)
    # The default value of cascade is "save-update, merge", so if we want to enable "delete", we
    # need to include the other options as well to maintain backwards compatibility.
    sample = relationship(  # type: ignore
        Sample,
        back_populates="aligned_pathogen_genome",
        uselist=False,
        cascade="delete, merge, save-update",
    )
    aligned_date = Column(DateTime, nullable=False, server_default=func.now())
    reference_name = Column(String, nullable=False)


class AlignedPeptides(idbase):  # type: ignore
    __tablename__ = "aligned_peptides"
    __table_args__ = (
        UniqueConstraint(
            "s3_bucket",
            "s3_key",
            name="uq_aligned_peptides_s3_bucket_key",
        ),
    )
    sample_id = Column(Integer, ForeignKey("samples.id"))
    sample = relationship("Sample", back_populates="aligned_peptides")  # type: ignore

    s3_bucket = Column(String, nullable=False)
    s3_key = Column(String, nullable=False)
