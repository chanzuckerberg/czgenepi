from sqlalchemy import Column, ForeignKey, Integer, String, UniqueConstraint

from .entity import Entity, EntityType
from .workflow import Workflow, WorkflowType


class HostFilteredSequencingReadCollection(Entity):
    __tablename__ = "host_filtered_sequencing_read_collections"
    __table_args__ = (UniqueConstraint("s3_bucket", "s3_key"),)
    __mapper_args__ = {"polymorphic_identity": EntityType.HOST_FILTERED_SEQUENCE_READS}

    entity_id = Column(Integer, ForeignKey(Entity.id), primary_key=True)

    s3_bucket = Column(String, nullable=False)
    s3_key = Column(String, nullable=False)


class FilterRead(Workflow):
    __tablename__ = "filter_read_workflows"
    __mapper_args__ = {"polymorphic_identity": WorkflowType.FILTER_READ}

    workflow_id = Column(Integer, ForeignKey(Workflow.id), primary_key=True)
