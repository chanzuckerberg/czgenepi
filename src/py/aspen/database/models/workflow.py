import enum
from typing import Mapping, MutableSequence, Union

import enumtables
from sqlalchemy import Column, DateTime, ForeignKey, JSON, Table
from sqlalchemy.orm import relationship

from aspen.database.models.base import base, idbase
from aspen.database.models.entity import _WORKFLOW_TABLENAME, Entity
from aspen.database.models.enum import Enum


class WorkflowType(enum.Enum):
    FILTER_READ = "FILTER_READ"
    ALIGN_READ = "ALIGN_READ"
    CALL_CONSENSUS = "CALL_CONSENSUS"
    PROCESS_GISAID_DUMP = "PROCESS_GISAID_DUMP"
    PHYLO_RUN = "PHYLO_RUN"


# Create the enumeration table
# Pass your enum class and the SQLAlchemy declarative base to enumtables.EnumTable
_WorkflowTypeTable = enumtables.EnumTable(
    WorkflowType,
    base,
    tablename="workflow_types",
)


class WorkflowStatusType(enum.Enum):
    STARTED = "STARTED"
    FAILED = "FAILED"
    COMPLETED = "COMPLETED"


# Create the enumeration table
# Pass your enum class and the SQLAlchemy declarative base to enumtables.EnumTable
_WorkflowStatusTypeTable = enumtables.EnumTable(
    WorkflowStatusType,
    base,
    tablename="workflow_status_types",
)


WorkflowInputs = Table(
    "workflow_inputs",
    base.metadata,
    Column("entity_id", ForeignKey(Entity.id), primary_key=True),
    Column("workflow_id", ForeignKey(f"{_WORKFLOW_TABLENAME}.id"), primary_key=True),
)


class Workflow(idbase):
    """A workflow describes some computational process undertaken on this system that
    takes one or more entities as inputs and produces one or more entities as
    outputs."""

    __tablename__ = _WORKFLOW_TABLENAME

    workflow_type = Column(
        Enum(WorkflowType),
        ForeignKey(_WorkflowTypeTable.item_id),
        nullable=False,
    )
    __mapper_args__: Mapping[str, Union[WorkflowType, Column]] = {
        "polymorphic_on": workflow_type
    }

    start_datetime = Column(
        DateTime, nullable=False, comment="datetime when the workflow is started."
    )
    end_datetime = Column(
        DateTime,
        nullable=True,
        comment="datetime when the workflow is ended.  this is only valid when the workflow's status is COMPLETED.",
    )

    workflow_status = Column(
        Enum(WorkflowStatusType),
        ForeignKey(_WorkflowStatusTypeTable.item_id),
        nullable=False,
    )

    software_versions = Column(
        JSON,
        nullable=False,
        comment=(
            "A mapping between all the tools used in this workflow and the version "
            "used."
        ),
    )

    inputs = relationship(
        Entity,
        secondary=WorkflowInputs,
        backref="consuming_workflows",
        uselist=True,
    )
    outputs: MutableSequence[Entity]
