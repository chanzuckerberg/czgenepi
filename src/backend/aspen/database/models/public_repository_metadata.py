from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    PrimaryKeyConstraint,
    String,
)
from sqlalchemy.orm import relationship

from aspen.database.models.base import base
from aspen.database.models.pathogens import Pathogen
from aspen.database.models.public_repositories import PublicRepository


class PublicRepositoryMetadata(base):  # type: ignore
    """Nightly snapshot of public repository (ex: gisaid/genbank) metadata"""

    __tablename__ = "public_repository_metadata"
    __table_args__ = (
        PrimaryKeyConstraint("pathogen_id", "strain", "public_repository_id"),
    )

    pathogen_id = Column(
        Integer,
        ForeignKey(Pathogen.id),
        nullable=False,
        primary_key=True,
    )
    pathogen = relationship(Pathogen, back_populates="public_repository_metadata")  # type: ignore
    public_repository_id = Column(
        Integer,
        ForeignKey(PublicRepository.id),
        nullable=False,
        primary_key=True,
    )
    public_repository = relationship(PublicRepository, back_populates="public_repository_metadata")  # type: ignore
    strain = Column(String, primary_key=True)
    lineage = Column(String, nullable=True)
    isl = Column(String, nullable=True)
    date = Column(DateTime, nullable=True)
    region = Column(
        String, nullable=True
    )  # Can be a value outside our RegionTable enum
    country = Column(String, nullable=True)
    division = Column(String, nullable=True)
    location = Column(String, nullable=True)
