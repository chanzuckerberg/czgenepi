# the main models in the database
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    MetaData,
    String,
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
base: DeclarativeMeta = declarative_base(cls=mx.BaseMixin, metadata=meta)


########################################################################################
# groups and users


class Group(base):
    """A group of users, generally a department of public health."""

    __tablename__ = "groups"

    name = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    address = Column(String, unique=True, nullable=False)

    def __repr__(self):
        return f"Group <{self.name}>"


class User(base):
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
# physical sample


class PhysicalSample(base):
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
