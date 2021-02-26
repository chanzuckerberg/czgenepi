import enum

import enumtables
from sqlalchemy import Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import backref, relationship

from aspen.database.models.base import base, idbase
from aspen.database.models.entity import Entity
from aspen.database.models.enum import Enum


class PublicRepositoryType(enum.Enum):
    GISAID = "GISAID"
    NCBI_SRA = "NCBI_SRA"
    GENBANK = "GENBANK"


# Create the enumeration table
# Pass your enum class and the SQLAlchemy declarative base to enumtables.EnumTable
_PublicRepositoryTypeTable = enumtables.EnumTable(
    PublicRepositoryType,
    base,
    tablename="public_repository_types",
)


class Accession(idbase):
    """A single accession of an entity."""

    __tablename__ = "accessions"
    __table_args__ = (UniqueConstraint("repository_type", "public_identifier"),)

    entity_id = Column(
        Integer,
        ForeignKey(Entity.id),
        nullable=False,
    )
    entity = relationship(Entity, backref=backref("accessions", uselist=True))

    repository_type = Column(
        Enum(PublicRepositoryType),
        ForeignKey(_PublicRepositoryTypeTable.item_id),
        nullable=False,
    )

    public_identifier = Column(String, nullable=False)
