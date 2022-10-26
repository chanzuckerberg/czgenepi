from __future__ import annotations

import sqlalchemy as sa
from sqlalchemy import Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import relationship

from aspen.database.models.base import idbase
from aspen.database.models.public_repositories import PublicRepository


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
    # not all pathogens will have a dataset name once we get into a generalized case
    nextclade_dataset_name = Column(String, nullable=True)

    # Lineages available for the pathogen
    lineages = relationship("PathogenLineage", back_populates="pathogen", uselist=True)  # type: ignore

    # workflows and workflow outputs
    raw_repository_data = relationship("RawRepositoryData", back_populates="pathogen", uselist=True)  # type: ignore
    processed_repository_data = relationship("ProcessedRepositoryData", back_populates="pathogen", uselist=True)  # type: ignore
    aligned_repository_data = relationship("AlignedRepositoryData", back_populates="pathogen", uselist=True)  # type: ignore
    repository_download_workflows = relationship("RepositoryDownloadWorkflow", back_populates="pathogen", uselist=True)  # type: ignore
    repository_alignment_workflows = relationship("RepositoryAlignmentWorkflow", back_populates="pathogen", uselist=True)  # type: ignore
    public_repository_metadata = relationship("PublicRepositoryMetadata", back_populates="pathogen", uselist=True)  # type: ignore

    samples = relationship("Sample", back_populates="pathogen")  # type: ignore
    phylo_runs = relationship("PhyloRun", back_populates="pathogen")  # type: ignore
    phylo_trees = relationship("PhyloTree", back_populates="pathogen")  # type: ignore

    @classmethod
    async def get_by_slug(cls, db: AsyncSession, slug: str) -> Pathogen:
        resp = await db.execute(sa.select(Pathogen).where(Pathogen.slug == slug))  # type: ignore
        return resp.scalars().one()


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
