from __future__ import annotations

from sqlalchemy import (
    Column,
    String,
    Integer,
    ForeignKey
)
from sqlalchemy.orm import relationship


from aspen.database.models.base import idbase


class Pathogen(idbase):  # type: ignore
    """Bacterial or Viral Pathogen Data"""

    __tablename__ = "pathogens"

    slug = Column(
        String,
        nullable=False,
        comment=(
            "Used as a URL param for differentiating functionality within CZGE, ex: SC2"
        ),
    )
    name = Column(
        String,
        nullable=False,
        comment=(
            "full pathogen abbreviated name, ex: SARS-CoV-2"
        ),
    )


class PathogenPrefix(idbase):  # type: ignore
    """prefix for sample identifiers """

    prefix = Column(String, nullable=False)

    pathogen_id = Column(Integer, ForeignKey("pathogen.id"))
    pathogen = relationship("Pathogen")

    public_repository_id = Column(Integer, ForeignKey("public_repository.id"))
    public_repository = relationship("PublicRepository")