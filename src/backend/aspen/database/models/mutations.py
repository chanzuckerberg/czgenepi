from __future__ import annotations

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from aspen.database.models.base import idbase


class SampleMutation(idbase):  # type: ignore
    __tablename__ = "sample_mutations"

    sample_id = Column(Integer, ForeignKey("samples.id"), nullable=False)
    sample = relationship("Sample", back_populates="mutations")  # type: ignore

    # nucleotides
    substitutions = Column(String, nullable=True)
    insertions = Column(String, nullable=True)
    deletions = Column(String, nullable=True)

    # proteins (amino acids)
    aa_substitutions = Column(String, nullable=True)
    aa_insertions = Column(String, nullable=True)
    aa_deletions = Column(String, nullable=True)
