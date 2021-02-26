from __future__ import annotations

from typing import Optional, TYPE_CHECKING

from sqlalchemy import (
    Column,
    Date,
    ForeignKey,
    Integer,
    JSON,
    String,
    text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import backref, relationship

from aspen.database.models.base import idbase
from aspen.database.models.mixins import DictMixin
from aspen.database.models.usergroup import Group

if TYPE_CHECKING:
    from .sequences import SequencingReadsCollection, UploadedPathogenGenome


class Sample(idbase, DictMixin):
    """A physical sample.  Multiple sequences can be taken of each physical sample."""

    __tablename__ = "samples"
    __table_args__ = (UniqueConstraint("submitting_group_id", "private_identifier"),)

    submitting_group_id = Column(
        Integer,
        ForeignKey(Group.id),
        nullable=False,
    )
    submitting_group = relationship(Group, backref=backref("samples", uselist=True))
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

    sample_collected_by = Column(
        String,
        nullable=False,
        info={
            "schema_mappings": {
                "PHA4GE": "sample_collected_by",
            }
        },
    )

    sample_collector_contact_email = Column(
        String,
        nullable=True,
        info={
            "schema_mappings": {
                "PHA4GE": "sample_collector_contact_email",
            }
        },
    )

    sample_collector_contact_address = Column(
        String,
        nullable=False,
        info={
            "schema_mappings": {
                "PHA4GE": "sample_collector_contact_address",
            }
        },
    )

    authors = Column(
        JSONB,
        nullable=False,
        default=text("'[]'::jsonb"),
        server_default=text("'[]'::jsonb"),
    )

    collection_date = Column(
        Date,
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

    organism = Column(
        String,
        nullable=False,
        info={
            "schema_mappings": {
                "PHA4GE": "organism",
            }
        },
    )

    host = Column(
        String,
        nullable=True,
        default="human",
        info={
            "schema_mappings": {
                "PHA4GE": "host_common_name",
            }
        },
    )

    purpose_of_sampling = Column(
        String,
        nullable=True,
        info={
            "schema_mappings": {
                "PHA4GE": "purpose_of_sampling",
            }
        },
    )

    specimen_processing = Column(
        String,
        nullable=True,
        info={
            "schema_mappings": {
                "PHA4GE": "specimen_processing",
            }
        },
    )

    sequencing_reads: Optional[SequencingReadsCollection]
    uploaded_pathogen_genome: Optional[UploadedPathogenGenome]
