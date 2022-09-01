from __future__ import annotations

from sqlalchemy import Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from aspen.database.models import PhyloRun, PhyloTree, PublicRepository, Sample
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

    samples = relationship(Sample, back_populates="pathogen")  # type: ignore
    phylo_runs = relationship(PhyloRun, back_populates="pathogen")  # type: ignore
    phylo_trees = relationship(PhyloTree, back_populates="pathogen")  # type: ignore


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

    public_repository_id = Column(
        Integer, ForeignKey(PublicRepository.id), nullable=False
    )
    public_repository: PublicRepository = relationship(PublicRepository)  # type: ignore

    pathogen_id = Column(Integer, ForeignKey(Pathogen.id), nullable=False)
    pathogen: Pathogen = relationship(Pathogen)  # type: ignore
