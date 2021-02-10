import enum
from typing import Mapping, Union

import enumtables
from sqlalchemy import Column, ForeignKey

from .base import base, idbase
from .enum import Enum


class EntityType(enum.Enum):
    SEQUENCING_READS = "SEQUENCING_READS"
    PATHOGEN_GENOME = "PATHOGEN_GENOME"
    HOST_FILTERED_SEQUENCE = "HOST_FILTERED_SEQUENCE"
    BAM = "BAM"
    RAW_GISAID_DUMP = "RAW_GISAID_DUMP"
    PROCESSED_GISAID_DUMP = "PROCESSED_GISAID_DUMP"


# Create the enumeration table
# Pass your enum class and the SQLAlchemy declarative base to enumtables.EnumTable
_EntityTypeTable = enumtables.EnumTable(
    EntityType,
    base,
    tablename="entity_types",
)


class Entity(idbase):
    """A piece of data in the system.  It is represented as a file, though not always
    local to the system."""

    __tablename__ = "entities"
    entity_type = Column(
        Enum(EntityType),
        ForeignKey(f"{_EntityTypeTable.__tablename__}.item_id"),
        nullable=False,
    )

    __mapper_args__: Mapping[str, Union[EntityType, Column]] = {
        "polymorphic_on": entity_type
    }
