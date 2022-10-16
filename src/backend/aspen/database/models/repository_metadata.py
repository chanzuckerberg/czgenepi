from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import backref, relationship

from aspen.database.models import Pathogen, PublicRepository
from aspen.database.models.base import base
from aspen.database.models.mixins import DictMixin


class RepositoryMetadata(base, DictMixin):  # type: ignore
    """Nightly snapshot of gisaid metadata"""

    __tablename__ = "repository_metadata"

    pathogen_id = Column(
        Integer,
        ForeignKey(Pathogen.id),
        nullable=False,
    )
    pathogen = relationship(Pathogen, backref=backref("metadata", uselist=True))  # type: ignore
    public_repository_id = Column(
        Integer,
        ForeignKey(PublicRepository.id),
        nullable=False,
    )
    public_repository = relationship(PublicRepository, backref=backref("metadata", uselist=True))  # type: ignore
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
