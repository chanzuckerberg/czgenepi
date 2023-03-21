from __future__ import annotations

from sqlalchemy import Column, String
from sqlalchemy.orm import relationship

from aspen.database.models.base import idbase


class PublicRepository(idbase):  # type: ignore
    """Public database of pathogen sequencing data, ex: GISAID/ GenBank"""

    __tablename__ = "public_repositories"

    name = Column(
        String,
        nullable=False,
        unique=True,
        comment=("Public Repository abbreviated name (ex: GISAID/GenBank)"),
    )

    # workflows and workflow outputs
    raw_repository_data = relationship("RawRepositoryData", back_populates="public_repository", uselist=True)  # type: ignore
    processed_repository_data = relationship("ProcessedRepositoryData", back_populates="public_repository", uselist=True)  # type: ignore
    aligned_repository_data = relationship("AlignedRepositoryData", back_populates="public_repository", uselist=True)  # type: ignore
    repository_download_workflows = relationship("RepositoryDownloadWorkflow", back_populates="public_repository", uselist=True)  # type: ignore
    repository_alignment_workflows = relationship("RepositoryAlignmentWorkflow", back_populates="public_repository", uselist=True)  # type: ignore
    public_repository_metadata = relationship("PublicRepositoryMetadata", back_populates="public_repository", uselist=True)  # type: ignore
    contextual_trees = relationship("PhyloTree", back_populates="contextual_repository", uselist=True)  # type: ignore
