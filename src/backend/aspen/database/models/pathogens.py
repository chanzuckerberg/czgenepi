from __future__ import annotations

from sqlalchemy import Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from aspen.database.models.base import idbase


class Pathogen(idbase):  # type: ignore
    """Bacterial or Viral Pathogen Data"""

    __tablename__ = "pathogens"

    slug = Column(
        String,
        nullable=False,
        unique=True,
        comment=(
            "Used as a URL param for differentiating functionality within CZGE, ex: SC2"
        ),
    )
    name = Column(
        String,
        nullable=False,
        unique=True,
        comment=("full pathogen abbreviated name, ex: SARS-CoV-2"),
    )


class PathogenPrefix(idbase):  # type: ignore
    """prefix for sample identifiers"""

    __tablename__ = "pathogen_prefixes"
    __table_args__ = (
        UniqueConstraint(
            "public_repository_id",
            "pathogen_id",
            name="uq_pathogen_prefixes_public_repository_id_pathogen_id",
        ),
    )

    prefix = Column(String, nullable=False)

    public_repository_id = Column(Integer, ForeignKey("public_repository.id"))
    public_repository = relationship("PublicRepository")

    pathogen_id = Column(Integer, ForeignKey("pathogen.id"))
    pathogen = relationship("Pathogen")
