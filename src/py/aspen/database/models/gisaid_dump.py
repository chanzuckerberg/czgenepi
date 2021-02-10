"""This module describes the entities and workflow for processing the gisaid dump."""
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint

from .entity import Entity, EntityType
from .workflow import Workflow, WorkflowType


class RawGisaidDump(Entity):
    __tablename__ = "raw_gisaid_dump"
    __table_args__ = (UniqueConstraint("s3_bucket", "s3_key"),)

    entity_id = Column(Integer, ForeignKey(Entity.id), primary_key=True)
    download_date = Column(DateTime, nullable=False)
    s3_bucket = Column(String, nullable=False)
    s3_key = Column(String, nullable=False)

    __mapper_args__ = {"polymorphic_identity": EntityType.RAW_GISAID_DUMP}


class ProcessedGisaidDump(Entity):
    __tablename__ = "processed_gisaid_dump"
    __table_args__ = (UniqueConstraint("s3_bucket", "s3_key"),)

    entity_id = Column(Integer, ForeignKey(Entity.id), primary_key=True)
    s3_bucket = Column(String, nullable=False)
    s3_key = Column(String, nullable=False)

    __mapper_args__ = {"polymorphic_identity": EntityType.PROCESSED_GISAID_DUMP}


class GisaidDumpWorkflow(Workflow):
    __tablename__ = "gisaid_workflows"
    __mapper_args__ = {"polymorphic_identity": WorkflowType.PROCESS_GISAID_DUMP}

    workflow_id = Column(Integer, ForeignKey(Workflow.id), primary_key=True)
