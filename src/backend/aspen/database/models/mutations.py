from __future__ import annotations

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from aspen.database.models.base import idbase


class SampleMutation(idbase):  # type: ignore
    __tablename__ = "sample_mutations"

    sample_id = Column(Integer, ForeignKey("samples.id"), nullable=False, unique=True)
    sample = relationship("Sample", back_populates="mutations")  # type: ignore

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
