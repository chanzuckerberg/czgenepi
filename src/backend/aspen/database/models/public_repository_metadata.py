from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from aspen.database.models.base import idbase
from aspen.database.models.mixins import DictMixin
from aspen.database.models.pathogens import Pathogen
from aspen.database.models.public_repositories import PublicRepository


class PublicRepositoryMetadata(idbase, DictMixin):  # type: ignore
    """Nightly snapshot of gisaid metadata"""

    __tablename__ = "repository_metadata"
    __table_args__ = (
        UniqueConstraint("pathogen_id", "public_repository_id", "strain"),
    )

    pathogen_id = Column(
        Integer,
        ForeignKey(Pathogen.id),
        nullable=False,
    )
    pathogen = relationship(Pathogen, back_populates="public_repository_metadata")  # type: ignore
    public_repository_id = Column(
        Integer,
        ForeignKey(PublicRepository.id),
        nullable=False,
    )
    public_repository = relationship(PublicRepository, back_populates="public_repository_metadata")  # type: ignore
    strain = Column(String, primary_key=True)
    lineage = Column(String, nullable=True)
    clade = Column(String, nullable=True)
    isl = Column(String, nullable=True)
    date = Column(DateTime, nullable=True)
    region = Column(
        String, nullable=True
    )  # Can be a value outside our RegionTable enum
    country = Column(String, nullable=True)
    division = Column(String, nullable=True)
    location = Column(String, nullable=True)
