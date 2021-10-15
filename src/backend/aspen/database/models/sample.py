from __future__ import annotations

import enum
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING, Union

import enumtables
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
from sqlalchemy.orm import backref, relationship, Session

from aspen.database.models.base import base, idbase
from aspen.database.models.enum import Enum
from aspen.database.models.mixins import DictMixin
from aspen.database.models.usergroup import Group, User

if TYPE_CHECKING:
    from .sequences import SequencingReadsCollection, UploadedPathogenGenome


class RegionType(enum.Enum):
    AFRICA = "Africa"
    ASIA = "Asia"
    EUROPE = "Europe"
    NORTH_AMERICA = "North America"
    OCEANIA = "Oceania"
    SOUTH_AMERICA = "South America"


# Create the enumeration table
# Pass your enum class and the SQLAlchemy declarative base to enumtables.EnumTable
_RegionTypeTable = enumtables.EnumTable(
    RegionType,
    base,
    tablename="region_types",
)


def create_public_ids(
    group_id: int, db_session: Session, num_needed: int, country: str = "USA"
) -> List[str]:
    """
    Generate a list of viable public ids for a specific group

    Parameters
    ----------
    group_id :
        The group_id to generate public ids for
    session :
        An open DB session object
    number_needed :
        The number of aspen public ids to generate

    Returns
    --------
    A list of newly generated public_ids
    """

    group: Group = db_session.query(Group).filter(Group.id == group_id).one()
    next_id: Union[int, None] = db_session.query(func.max(Sample.id)).scalar()

    # catch if no max
    if not next_id:
        next_id = 0
    next_id += 1
    ids: List[str] = []
    # some group prefixes already have a dash, but if they don't add a dash to the end
    group_prefix = group.prefix if group.prefix[-1] == "-" else f"{group.prefix}-"
    for i in range(num_needed):
        current_year: str = datetime.today().strftime("%Y")
        country: str = country  # type: ignore
        ids.append(f"hCoV-19/{country}/{group_prefix}{next_id}/{current_year}")
        next_id += 1
    return ids


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
    region = Column(
        Enum(RegionType),
        ForeignKey(_RegionTypeTable.item_id),
        nullable=False,
        comment="This is the continent this sample was collected from.",
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

    czb_failed_genome_recovery = Column(
        Boolean,
        nullable=True,
        default=False,
        server_default=sql.expression.false(),
        comment=(
            "This is set to true iff this is sample sequenced by CZB and failed genome "
            "recovery."
        ),
    )

    sequencing_reads_collection: Optional[SequencingReadsCollection]
    uploaded_pathogen_genome: Optional[UploadedPathogenGenome]

    def get_uploaded_entity(
        self,
    ) -> Union[SequencingReadsCollection, UploadedPathogenGenome]:
        if self.sequencing_reads_collection is not None:
            return self.sequencing_reads_collection
        elif self.uploaded_pathogen_genome is not None:
            return self.uploaded_pathogen_genome
        raise ValueError(
            "Sample has neither sequencing reads nor uploaded pathogen genome."
        )
