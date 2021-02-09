from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import backref, relationship

from .base import idbase
from .usergroup import Group


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
