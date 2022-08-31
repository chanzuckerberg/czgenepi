from __future__ import annotations

from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    ForeignKey,
    func,
    Integer,
    JSON,
    sql,
    String,
    text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import backref, relationship

from aspen.database.models.accessions import Accession
from aspen.database.models.base import idbase
from aspen.database.models.locations import Location
from aspen.database.models.mixins import DictMixin
from aspen.database.models.pathogens import Pathogen
from aspen.database.models.usergroup import Group, User

if TYPE_CHECKING:
    from .sequences import UploadedPathogenGenome


class Sample(idbase, DictMixin):  # type: ignore
    """A physical sample.  Multiple sequences can be taken of each physical sample."""

    __tablename__ = "samples"
    __table_args__ = (
        # Unique index uses default name format of `uq_samples_submitting_group_id`
        UniqueConstraint("submitting_group_id", "private_identifier"),
        UniqueConstraint(
            "submitting_group_id",
            "public_identifier",
            # To avoid overlapping above unique index, explicitly set `name` here
            name="uq_samples_submitting_group_id_public_identifier",
        ),
    )

    submitting_group_id = Column(
        Integer,
        ForeignKey(Group.id),
        nullable=False,
    )
    submitting_group = relationship(Group, backref=backref("samples", uselist=True))  # type: ignore
    uploaded_by_id = Column(
        Integer,
        ForeignKey(User.id),
        nullable=False,
    )
    uploaded_by = relationship(User, backref=backref("samples", uselist=True))  # type: ignore
    pathogen_id = Column(
        Integer, ForeignKey(Pathogen.id)
    )  # TODO: change to nullable=False once we update workflows

    pathogen = relationship(Pathogen, back_populates="samples")
    private = Column(Boolean, nullable=False, default=False)
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
        default={},
        comment="This is the original metadata submitted by the user.",
    )

    public_identifier = Column(
        String,
        nullable=False,
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
        nullable=True,
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

    # new location data
    location_id = Column(
        Integer,
        ForeignKey(Location.id),
        nullable=True,
    )
    collection_location = relationship("Location")  # type: ignore

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

    czb_failed_genome_recovery = Column(
        Boolean,
        nullable=True,
        default=False,
        server_default=sql.expression.false(),
        comment=(
            "This is set to true iff this sample was sequenced by CZB and failed genome "
            "recovery."
        ),
    )

    accessions = relationship(
        Accession,
        backref=backref("sample", uselist=False),
        cascade="all, delete",
        uselist=True,
    )  # type: ignore

    uploaded_pathogen_genome: Optional[UploadedPathogenGenome]

    def generate_public_identifier(self, already_exists=False):
        # If we don't have an explicit public identifier, generate one from
        # our current model context
        if self.public_identifier:
            return

        country = self.collection_location.country
        group_prefix = self.submitting_group.prefix
        current_year: str = datetime.today().strftime("%Y")
        if already_exists:
            id = self.id
            self.public_identifier = (
                f"hCoV-19/{country}/{group_prefix}-{id}/{current_year}"
            )
        else:
            self.public_identifier = func.concat(
                f"hCoV-19/{country}/{group_prefix}-",
                text("currval('aspen.samples_id_seq')"),
                f"/{current_year}",
            )
