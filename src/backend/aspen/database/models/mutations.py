from __future__ import annotations

import enum

import enumtables
from sqlalchemy import Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from aspen.database.models.base import base, idbase
from aspen.database.models.enum import Enum


class MutationsCaller(enum.Enum):
    """All the tools/ways we use to call the Mutations info over all pathogens.

    Right now we only have one, but over time we think it's likely we'll want
    to support multiple different tools/ways to get the mutations for a sample
    and that a sample could have multiple different mutations records from
    different toolsassociated with it, one for each of the various tools
    that can run on that pathogen type."""

    NEXTCLADE = "NEXTCLADE"


_MutationsCallerTable = enumtables.EnumTable(
    MutationsCaller, base, tablename="mutations_callers"
)


class SampleMutation(idbase):  # type: ignore
    __tablename__ = "sample_mutations"
    __table_args__ = (
        UniqueConstraint(
            "sample_id",
            "mutations_caller",
        ),
    )

    sample_id = Column(Integer, ForeignKey("samples.id"), nullable=False, unique=True)
    sample = relationship("Sample", back_populates="mutations")  # type: ignore
    # What tool/method was used to produce this object of SampleMutation.
    mutations_caller = Column(
        Enum(MutationsCaller),
        ForeignKey(_MutationsCallerTable.item_id),
        nullable=False,
    )

    # nucleotides
    substitutions = Column(String, nullable=True)
    insertions = Column(String, nullable=True)
    deletions = Column(String, nullable=True)

    # proteins (amino acids)
    aa_substitutions = Column(String, nullable=True)
    aa_insertions = Column(String, nullable=True)
    aa_deletions = Column(String, nullable=True)

    # For Nextclade, we need to track the underlying sequence accession (part
    # of the reference data bundle) to know what the mutations are off of.
    # TODO FIXME: Lots of table/row duplication here. _Probably_ better to
    # normalize it as a single entry somewhere and then reference that.
    # Evaluate later -- because of how we use this, not hard to change later.
    # Search this to find all instances: §NextcladeTagDuplicationTODO
    reference_sequence_accession = Column(String, nullable=True)
