"""This module describes the entities and workflow for processing the gisaid dump."""
from __future__ import annotations

from typing import MutableSequence, Sequence

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from aspen.database.models.entity import Entity, EntityType
from aspen.database.models.pathogens import Pathogen
from aspen.database.models.public_repositories import PublicRepository
from aspen.database.models.workflow import Workflow, WorkflowType


class RawRepositoryDump(Entity):
    __tablename__ = "raw_repository_dump"
    __table_args__ = (UniqueConstraint("s3_bucket", "s3_key"),)

    entity_id = Column(Integer, ForeignKey(Entity.id), primary_key=True)
    pathogen_id = Column(Integer, ForeignKey(Pathogen.id), nullable=False)
    pathogen = relationship(Pathogen, back_populates="repository_dumps", uselist=True)  # type: ignore
    public_repository_id = Column(
        Integer, ForeignKey(PublicRepository.id), nullable=False
    )
    public_repository = relationship(PublicRepository, back_populates="repository_dumps", uselist=True)  # type: ignore
    download_date = Column(DateTime, nullable=False)
    s3_bucket = Column(String, nullable=False)
    s3_key = Column(String, nullable=False)

    __mapper_args__ = {"polymorphic_identity": EntityType.RAW_PUBLIC_REPOSITORY_DUMP}

    @property
    def processed_repository_dumps(self) -> Sequence[ProcessedRepositoryDump]:
        """A sequence of processed gisaid dumps generated from this raw gisaid dump."""
        results: MutableSequence[ProcessedRepositoryDump] = list()
        for workflow, entities in self.get_children(ProcessedRepositoryDump):
            results.extend(entities)

        return results


class ProcessedRepositoryDump(Entity):
    __tablename__ = "processed_repository_dump"
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

    entity_id = Column(Integer, ForeignKey(Entity.id), primary_key=True)
    pathogen_id = Column(Integer, ForeignKey(Pathogen.id), nullable=False)
    pathogen = relationship(Pathogen, back_populates="repository_dumps", uselist=True)  # type: ignore
    public_repository_id = Column(
        Integer, ForeignKey(PublicRepository.id), nullable=False
    )
    public_repository = relationship(PublicRepository, back_populates="repository_dumps", uselist=True)  # type: ignore
    s3_bucket = Column(String, nullable=False)
    sequences_s3_key = Column(String, nullable=False)
    metadata_s3_key = Column(String, nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": EntityType.PROCESSED_PUBLIC_REPOSITORY_DUMP
    }

    @property
    def raw_repository_dump(self) -> RawRepositoryDump:
        """The raw gisaid dump this processed gisaid dump was generated from."""
        parents = self.get_parents(RawRepositoryDump)
        assert len(parents) == 1
        return parents[0]


class AlignedRepositoryDump(Entity):
    __tablename__ = "aligned_repository_dump"
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

    entity_id = Column(Integer, ForeignKey(Entity.id), primary_key=True)
    pathogen_id = Column(Integer, ForeignKey(Pathogen.id), nullable=False)
    pathogen = relationship(Pathogen, back_populates="repository_dumps", uselist=True)  # type: ignore
    public_repository_id = Column(
        Integer, ForeignKey(PublicRepository.id), nullable=False
    )
    public_repository = relationship(PublicRepository, back_populates="repository_dumps", uselist=True)  # type: ignore
    s3_bucket = Column(String, nullable=False)
    sequences_s3_key = Column(String, nullable=False)
    metadata_s3_key = Column(String, nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": EntityType.ALIGNED_PUBLIC_REPOSITORY_DUMP
    }


class RepositoryDumpWorkflow(Workflow):
    __tablename__ = "repository_workflows"
    __mapper_args__ = {
        "polymorphic_identity": WorkflowType.PROCESS_PUBLIC_REPOSITORY_DUMP
    }

    workflow_id = Column(Integer, ForeignKey(Workflow.id), primary_key=True)
    pathogen_id = Column(Integer, ForeignKey(Pathogen.id), nullable=False)
    pathogen = relationship(Pathogen, back_populates="repository_dumps", uselist=True)  # type: ignore
    public_repository_id = Column(
        Integer, ForeignKey(PublicRepository.id), nullable=False
    )
    public_repository = relationship(PublicRepository, back_populates="repository_dumps", uselist=True)  # type: ignore


class RepositoryAlignmentWorkflow(Workflow):
    __tablename__ = "repository_alignment_workflows"
    __mapper_args__ = {
        "polymorphic_identity": WorkflowType.ALIGN_PUBLIC_REPOSITORY_DUMP
    }

    workflow_id = Column(Integer, ForeignKey(Workflow.id), primary_key=True)
    pathogen_id = Column(Integer, ForeignKey(Pathogen.id), nullable=False)
    pathogen = relationship(Pathogen, back_populates="repository_dumps", uselist=True)  # type: ignore
    public_repository_id = Column(
        Integer, ForeignKey(PublicRepository.id), nullable=False
    )
    public_repository = relationship(PublicRepository, back_populates="repository_dumps", uselist=True)  # type: ignore
