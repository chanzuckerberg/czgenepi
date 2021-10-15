from __future__ import annotations

import datetime
import enum
from dataclasses import dataclass
from typing import Optional, Type

from sqlalchemy import Column, ForeignKey, Integer, String, UniqueConstraint

from aspen.database.models.entity import Entity, EntityType
from aspen.database.models.workflow import Workflow, WorkflowStatusType, WorkflowType


class Accession(Entity):
    @classmethod
    def attach_to_entity(
        cls,
        entity: Entity,
        public_identifier: str,
        workflow_start_datetime: Optional[datetime.datetime] = None,
        workflow_end_datetime: Optional[datetime.datetime] = None,
    ):
        raise NotImplementedError()


class GisaidAccession(Accession):
    """A single GISAID accession of a pathogen genome."""

    __tablename__ = "gisaid_accessions"
    __mapper_args__ = {"polymorphic_identity": EntityType.GISAID_REPOSITORY_SUBMISSION}

    entity_id = Column(Integer, ForeignKey(Entity.id), primary_key=True)

    public_identifier = Column(String, nullable=True)

    @classmethod
    def attach_to_entity(
        cls,
        entity: Entity,
        public_identifier: str,
        workflow_start_datetime: Optional[datetime.datetime] = None,
        workflow_end_datetime: Optional[datetime.datetime] = None,
    ):
        assert not isinstance(entity, Accession)

        accession = GisaidAccession(
            public_identifier=public_identifier,
        )
        workflow = GisaidAccessionWorkflow(
            software_versions={},
            workflow_status=WorkflowStatusType.COMPLETED,
            start_datetime=workflow_start_datetime,
            end_datetime=workflow_end_datetime,
        )
        accession.producing_workflow = workflow
        entity.consuming_workflows.append(workflow)


class GisaidAccessionWorkflow(Workflow):
    __tablename__ = "gisaid_accession_workflows"
    __mapper_args__ = {
        "polymorphic_identity": WorkflowType.GISAID_REPOSITORY_SUBMISSION
    }

    workflow_id = Column(Integer, ForeignKey(Workflow.id), primary_key=True)


class GenbankAccession(Accession):
    """A single GENBANK accession of a pathogen genome."""

    __tablename__ = "genbank_accessions"
    __table_args__ = (UniqueConstraint("public_identifier"),)
    __mapper_args__ = {"polymorphic_identity": EntityType.GENBANK_REPOSITORY_SUBMISSION}

    entity_id = Column(Integer, ForeignKey(Entity.id), primary_key=True)

    public_identifier = Column(String, nullable=False)

    @classmethod
    def attach_to_entity(
        cls,
        entity: Entity,
        public_identifier: str,
        workflow_start_datetime: Optional[datetime.datetime] = None,
        workflow_end_datetime: Optional[datetime.datetime] = None,
    ):
        assert not isinstance(entity, Accession)

        accession = GenbankAccession(
            public_identifier=public_identifier,
        )
        workflow = GenbankAccessionWorkflow(
            software_versions={},
            workflow_status=WorkflowStatusType.COMPLETED,
            start_datetime=workflow_start_datetime,
            end_datetime=workflow_end_datetime,
        )
        accession.producing_workflow = workflow
        entity.consuming_workflows.append(workflow)


class GenbankAccessionWorkflow(Workflow):
    __tablename__ = "genbank_accession_workflows"
    __mapper_args__ = {
        "polymorphic_identity": WorkflowType.GENBANK_REPOSITORY_SUBMISSION
    }

    workflow_id = Column(Integer, ForeignKey(Workflow.id), primary_key=True)


@dataclass
class PublicRepositoryTypeMetadata:
    entity_type: EntityType
    accession_cls: Type[Accession]
    accession_workflow_cls: Type[Workflow]


class PublicRepositoryType(enum.Enum):
    GISAID = PublicRepositoryTypeMetadata(
        EntityType.GISAID_REPOSITORY_SUBMISSION,
        GisaidAccession,
        GisaidAccessionWorkflow,
    )
    GENBANK = PublicRepositoryTypeMetadata(
        EntityType.GENBANK_REPOSITORY_SUBMISSION,
        GenbankAccession,
        GenbankAccessionWorkflow,
    )

    @staticmethod
    def from_entity_type(entity_type: EntityType) -> PublicRepositoryType:
        for public_repository_type in PublicRepositoryType:
            if public_repository_type.value.entity_type == entity_type:
                return public_repository_type
        raise ValueError(
            f"Entity type {entity_type} not registered with PublicRepositoryType"
            " class."
        )
