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


class PathogenRepoConfig(idbase):  # type: ignore
    """pathogen specific data required for interacting with public databases such as GISAID and GenBank"""

    __tablename__ = "pathogen_repo_configs"
    __table_args__ = (
        UniqueConstraint(
            "public_repository_id",
            "pathogen_id",
            name="uq_pathogen_repo_configs_public_repository_id_pathogen_id",
        ),
    )

    prefix = Column(
        String, nullable=False, comment="identifier samples prefix, ex: hCoV-19"
    )

    public_repository_id = Column(Integer, ForeignKey("public_repository.id"))
    public_repository = relationship("PublicRepository")

    pathogen_id = Column(Integer, ForeignKey("pathogen.id"))
    pathogen = relationship("Pathogen")
