import enum

import enumtables
from sqlalchemy import (
    Column,
    event,
    ForeignKey,
    Integer,
    String,
    text,
    UniqueConstraint,
)
from sqlalchemy.orm import backref, relationship

from .base import base, idbase
from .entity import Entity
from .enum import Enum


class PublicRepositoryType(enum.Enum):
    GISAID = "GISAID"
    NCBI_SRA = "NCBI_SRA"


# Create the enumeration table
# Pass your enum class and the SQLAlchemy declarative base to enumtables.EnumTable
_PublicRepositoryTypeTable = enumtables.EnumTable(
    PublicRepositoryType,
    base,
    tablename="publicrepositorytypes",
)


def _after_publicrepositorytypes_create(target, connection, **kw):
    for entitytype in PublicRepositoryType:
        connection.execute(
            text(
                f"INSERT INTO {target.schema}.{target.name} (item_id) VALUES (:name)"
            ).params(name=entitytype.value)
        )


event.listen(
    _PublicRepositoryTypeTable.__table__,
    "after_create",
    _after_publicrepositorytypes_create,
)


class PublicRepository(idbase):
    """A public repository for genetic or epidemiology data."""

    __tablename__ = "public_repository"
    entity_type = Column(
        Enum(PublicRepositoryType),
        ForeignKey(f"{_PublicRepositoryTypeTable.__tablename__}.item_id"),
        nullable=False,
    )

    name = Column(String, nullable=False, unique=True)
    website = Column(String, nullable=False, unique=True)


class Accession(base):
    """A single accession of an entity."""

    __tablename__ = "accessions"
    __table_args__ = (UniqueConstraint("public_repository_id", "public_identifier"),)

    entity_id = Column(
        Integer,
        ForeignKey(f"{Entity.__tablename__}.id"),
        primary_key=True,
    )
    entity = relationship(Entity, backref=backref("accessions", uselist=True))

    public_repository_id = Column(
        Integer,
        ForeignKey(f"{PublicRepository.__tablename__}.id"),
        primary_key=True,
    )
    public_repository = relationship(
        PublicRepository,
        backref=backref("accessions", uselist=True),
    )

    public_identifier = Column(String, nullable=False)
