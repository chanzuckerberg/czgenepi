"""This module describes the entities and workflow for processing public repo datasets."""
from __future__ import annotations

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from aspen.database.models.entity import Entity, EntityType
from aspen.database.models.pathogens import Pathogen
from aspen.database.models.public_repositories import PublicRepository
from aspen.database.models.workflow import Workflow, WorkflowType


class RawRepositoryData(Entity):
    __tablename__ = "raw_repository_data"
    __table_args__ = (UniqueConstraint("s3_bucket", "s3_key"),)
    __mapper_args__ = {"polymorphic_identity": EntityType.RAW_PUBLIC_REPOSITORY_DATA}

    entity_id = Column(Integer, ForeignKey(Entity.id), primary_key=True)
    pathogen_id = Column(Integer, ForeignKey(Pathogen.id), nullable=False)
    pathogen = relationship(Pathogen, back_populates="raw_repository_data")  # type: ignore
    public_repository_id = Column(
        Integer, ForeignKey(PublicRepository.id), nullable=False
    )
    public_repository = relationship(PublicRepository, back_populates="raw_repository_data")  # type: ignore
    download_date = Column(DateTime, nullable=False)
    s3_bucket = Column(String, nullable=False)
    s3_key = Column(String, nullable=False)


class ProcessedRepositoryData(Entity):
    __tablename__ = "processed_repository_data"
    __table_args__ = (
        UniqueConstraint(
            "s3_bucket",
            "sequences_s3_key",
        ),
        UniqueConstraint(
            "s3_bucket",
            "metadata_s3_key",
        ),
    )
    __mapper_args__ = {
        "polymorphic_identity": EntityType.PROCESSED_PUBLIC_REPOSITORY_DATA
    }

    entity_id = Column(Integer, ForeignKey(Entity.id), primary_key=True)
    pathogen_id = Column(Integer, ForeignKey(Pathogen.id), nullable=False)
    pathogen = relationship(Pathogen, back_populates="processed_repository_data")  # type: ignore
    public_repository_id = Column(
        Integer, ForeignKey(PublicRepository.id), nullable=False
    )
    public_repository = relationship(PublicRepository, back_populates="processed_repository_data")  # type: ignore
    s3_bucket = Column(String, nullable=False)
    sequences_s3_key = Column(String, nullable=False)
    metadata_s3_key = Column(String, nullable=False)


class AlignedRepositoryData(Entity):
    __tablename__ = "aligned_repository_data"
    __table_args__ = (
        UniqueConstraint(
            "s3_bucket",
            "sequences_s3_key",
        ),
        UniqueConstraint(
            "s3_bucket",
            "metadata_s3_key",
        ),
    )
    __mapper_args__ = {
        "polymorphic_identity": EntityType.ALIGNED_PUBLIC_REPOSITORY_DATA
    }

    entity_id = Column(Integer, ForeignKey(Entity.id), primary_key=True)
    pathogen_id = Column(Integer, ForeignKey(Pathogen.id), nullable=False)
    pathogen = relationship(Pathogen, back_populates="aligned_repository_data")  # type: ignore
    public_repository_id = Column(
        Integer, ForeignKey(PublicRepository.id), nullable=False
    )
    public_repository = relationship(PublicRepository, back_populates="aligned_repository_data")  # type: ignore
    s3_bucket = Column(String, nullable=False)
    sequences_s3_key = Column(String, nullable=False)
    metadata_s3_key = Column(String, nullable=False)


class RepositoryDownloadWorkflow(Workflow):
    __tablename__ = "repository_workflows"
    __mapper_args__ = {"polymorphic_identity": WorkflowType.DOWNLOAD_PUBLIC_REPOSITORY}

    workflow_id = Column(Integer, ForeignKey(Workflow.id), primary_key=True)
    pathogen_id = Column(Integer, ForeignKey(Pathogen.id), nullable=False)
    pathogen = relationship(Pathogen, back_populates="repository_download_workflows")  # type: ignore
    public_repository_id = Column(
        Integer, ForeignKey(PublicRepository.id), nullable=False
    )
    public_repository = relationship(PublicRepository, back_populates="repository_download_workflows")  # type: ignore


class RepositoryAlignmentWorkflow(Workflow):
    __tablename__ = "repository_alignment_workflows"
    __mapper_args__ = {
        "polymorphic_identity": WorkflowType.ALIGN_PUBLIC_REPOSITORY_DATA
    }

    workflow_id = Column(Integer, ForeignKey(Workflow.id), primary_key=True)
    pathogen_id = Column(Integer, ForeignKey(Pathogen.id), nullable=False)
    pathogen = relationship(Pathogen, back_populates="repository_alignment_workflows")  # type: ignore
    public_repository_id = Column(
        Integer, ForeignKey(PublicRepository.id), nullable=False
    )
    public_repository = relationship(PublicRepository, back_populates="repository_alignment_workflows")  # type: ignore
