import enum
from typing import Mapping, Union

import enumtables
from sqlalchemy import Column, DateTime, ForeignKey, JSON, Table
from sqlalchemy.orm import relationship

from .base import base, idbase
from .entity import Entity
from .enum import Enum

_WORKFLOW_TABLENAME = "workflows"  # need this for a forward reference.


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


_workflow_inputs_table = Table(
    "workflow_inputs",
    base.metadata,
    Column("entity_id", ForeignKey(Entity.id), primary_key=True),
    Column("workflow_id", ForeignKey(f"{_WORKFLOW_TABLENAME}.id"), primary_key=True),
)
_workflow_outputs_table = Table(
    "workflow_outputs",
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

    run_date = Column(
        DateTime,
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
        secondary=_workflow_inputs_table,
        backref="workflow_consumers",
    )
    outputs = relationship(
        Entity,
        secondary=_workflow_outputs_table,
        backref="workflow_producers",
    )
