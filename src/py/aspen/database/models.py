from __future__ import annotations

# the main models in the database
import enum
from typing import Type, TYPE_CHECKING, TypeVar

import enumtables
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    event,
    ForeignKey,
    Integer,
    JSON,
    MetaData,
    String,
    text,
    UniqueConstraint,
)
from sqlalchemy.ext.declarative import declarative_base, DeclarativeMeta
from sqlalchemy.orm import backref, relationship

from . import modelmixins as mx

meta = MetaData(
    schema="aspen",
    naming_convention={
        "ix": "ix_%(column_0_label)s",
        "uq": "uq_%(table_name)s_%(column_0_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "pk": "pk_%(table_name)s",
    },
)
# typing "base" as DeclarativeMeta is the ugly workaround for
# https://github.com/python/mypy/issues/2477
base: DeclarativeMeta = declarative_base(metadata=meta)
idbase: DeclarativeMeta = declarative_base(cls=mx.BaseMixin, metadata=meta)

# Mypy gets confused about whether sqlalchemy enum columns are strings or enums, see here:
# https://github.com/dropbox/sqlalchemy-stubs/issues/114
# This is the (gross) workaround. Keep an eye on the issue and get rid of it once it's fixed.
if TYPE_CHECKING:
    from sqlalchemy.sql.type_api import TypeEngine

    T = TypeVar("T")

    class Enum(TypeEngine[T]):
        def __init__(self, enum: Type[T]) -> None:
            ...


else:

    from enumtables import EnumType as Enum


########################################################################################
# groups and users


class Group(idbase):
    """A group of users, generally a department of public health."""

    __tablename__ = "groups"

    name = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    address = Column(String, unique=True, nullable=False)

    def __repr__(self):
        return f"Group <{self.name}>"


class User(idbase):
    """A user."""

    __tablename__ = "users"

    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    auth0_user_id = Column(String, unique=True, nullable=False)
    group_admin = Column(Boolean, nullable=False)
    system_admin = Column(Boolean, nullable=False)

    group_id = Column(Integer, ForeignKey(f"{Group.__tablename__}.id"), nullable=False)
    group = relationship(Group, backref=backref("users", uselist=True))

    def __repr__(self):
        return f"User <{self.name}>"


########################################################################################
# cross-group viewing


class DataType(enum.Enum):
    TREES = "TREES"
    SEQUENCES = "SEQUENCES"
    METADATA = "METADATA"


# Create the enumeration table
# Pass your enum class and the SQLAlchemy declarative base to enumtables.EnumTable
_DataTypeTable = enumtables.EnumTable(
    DataType,
    base,
    tablename="datatypes",
)


def _after_datatypes_create(target, connection, **kw):
    for datatype in DataType:
        connection.execute(
            text(
                f"INSERT INTO {target.schema}.{target.name} (item_id) VALUES (:name)"
            ).params(name=datatype.value)
        )


event.listen(_DataTypeTable.__table__, "after_create", _after_datatypes_create)


class CanSee(idbase):
    """
    Expresses a relationship where users from a group can see some data of another
    group.
    """

    __tablename__ = "can_see"

    viewer_group_id = Column(
        Integer, ForeignKey(f"{Group.__tablename__}.id"), nullable=False
    )
    viewer_group = relationship(
        Group, backref=backref("can_see", uselist=True), foreign_keys=[viewer_group_id]
    )
    owner_group_id = Column(
        Integer, ForeignKey(f"{Group.__tablename__}.id"), nullable=False
    )
    owner_group = relationship(
        Group,
        backref=backref("can_be_seen_by", uselist=True),
        foreign_keys=[owner_group_id],
    )
    data_type = Column(
        Enum(DataType),
        ForeignKey(f"{_DataTypeTable.__tablename__}.item_id"),
        nullable=False,
    )


########################################################################################
# physical sample


class PhysicalSample(idbase):
    """A physical sample.  Multiple sequences can be taken of each physical sample."""

    __tablename__ = "physical_samples"
    __table_args__ = (UniqueConstraint("submitting_group_id", "private_identifier"),)

    submitting_group_id = Column(
        Integer,
        ForeignKey(f"{Group.__tablename__}.id"),
        nullable=False,
    )
    submitting_group = relationship(
        Group, backref=backref("physical_samples", uselist=True)
    )
    private_identifier = Column(
        String,
        nullable=False,
        comment=(
            "This is the private identifier groups (DPHs) will use to map data back to "
            "their internal databases."
        ),
    )
    original_submission = Column(
        JSON,
        nullable=False,
        comment="This is the original metadata submitted by the user.",
    )

    public_identifier = Column(
        String,
        nullable=False,
        unique=True,
        comment="This is the public identifier we assign to this sample.",
    )

    collection_date = Column(
        DateTime,
        nullable=False,
        info={
            "schema_mappings": {
                "PHA4GE": "sample_collection_date",
            }
        },
    )

    # location
    location = Column(String, nullable=False)
    division = Column(
        String,
        nullable=False,
        info={
            "schema_mappings": {
                "PHA4GE": "geo_loc_name_state_province_region",
            }
        },
    )
    country = Column(
        String,
        nullable=False,
        info={
            "schema_mappings": {
                "PHA4GE": "geo_loc_name_country",
            }
        },
    )

    # TODO: (ttung) (sidneymbell) leaving out a lot of fields for now.
    purpose_of_sampling = Column(
        String,
        info={
            "schema_mappings": {
                "PHA4GE": "purpose_of_sampling",
            }
        },
    )
