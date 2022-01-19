from __future__ import annotations

import datetime
import enum
from dataclasses import dataclass
from typing import Optional, Type

import enumtables
from sqlalchemy import (
    Column,
    ForeignKey,
    ForeignKeyConstraint,
    Integer,
    PrimaryKeyConstraint,
    String,
    UniqueConstraint,
)

from aspen.database.models.base import base
from aspen.database.models.entity import Entity, EntityType
from aspen.database.models.enum import Enum
from aspen.database.models.workflow import Workflow, WorkflowStatusType, WorkflowType


class AccessionType(enum.Enum):
    GISAID_ISL = "GISAID_ISL"
    GENBANK = "GENBANK"


_AccessionTypeTable = enumtables.EnumTable(
    AccessionType,
    base,
    tablename="accession_types",
)


class Accession(base):  # type: ignore
    """An accession for a single sample."""

    __tablename__ = "accessions"
    __table_args__ = (
        PrimaryKeyConstraint("sample_id", name="pk_accessions_sample_id"),
        ForeignKeyConstraint(
            ["sample_id"],
            ["aspen.samples.id"],
            name="fk_accession_data_sample_id_samples",
        ),
        ForeignKeyConstraint(
            ["accession_type"],
            ["aspen.accession_types.item_id"],
            name="fk_accessions_accession_type_accession_types",
        ),
        UniqueConstraint(
            "sample_id",
            "accession_type",
            name="uq_accessions_sample_id_accession_type",
        ),
    )

    sample_id = Column(
        Integer, ForeignKey("samples.id", ondelete="CASCADE"), primary_key=True
    )

    accession_type = Column(
        Enum(AccessionType),
        ForeignKey(_AccessionTypeTable.item_id),
        nullable=False,
    )

    accession = Column(String, nullable=False)


class AccessionBase(Entity):
    @classmethod
    def attach_to_entity(
        cls,
        entity: Entity,
        public_identifier: str,
        workflow_start_datetime: Optional[datetime.datetime] = None,
        workflow_end_datetime: Optional[datetime.datetime] = None,
    ):
        raise NotImplementedError()


class GisaidAccession(AccessionBase):
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
        assert not isinstance(entity, AccessionBase)

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


class GenbankAccession(AccessionBase):
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
        assert not isinstance(entity, AccessionBase)

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
    accession_cls: Type[AccessionBase]
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
