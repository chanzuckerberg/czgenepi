from sqlalchemy import Column, DateTime, String

from aspen.database.models.base import base
from aspen.database.models.mixins import DictMixin
from aspen.database.models.public_repositories import PublicRepository
from aspen.database.models.pathogens import Pathogen
from sqlalchemy import Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship


class PublicRepoMetadata(base, DictMixin):  # type: ignore
    """Nightly snapshot of gisaid/genbank metadata"""

    __tablename__ = "public_repo_metadata"

    strain = Column(String, primary_key=True)
    public_repository_id = Column(
        Integer, ForeignKey(PublicRepository.id), nullable=False
    )
    public_repository: PublicRepository = relationship(PublicRepository)  # type: ignore
    pathogen_id = Column(Integer, ForeignKey(Pathogen.id), nullable=False)
    pathogen: Pathogen = relationship(Pathogen)  # type: ignore

    lineage = Column(String, nullable=True)
    clade = Column(String, nullable=True)
    epi_isl = Column(String, nullable=True)
    date = Column(DateTime, nullable=True)
    region = Column(
        String, nullable=True
    )  # Can be a value outside our RegionTable enum
    country = Column(String, nullable=True)
    division = Column(String, nullable=True)
    location = Column(String, nullable=True)

class GisaidMetadata(base, DictMixin):  # type: ignore
    """Nightly snapshot of gisaid metadata"""

    __tablename__ = "gisaid_metadata"

    strain = Column(String, primary_key=True)
    pango_lineage = Column(String, nullable=True)
    gisaid_clade = Column(String, nullable=True)
    gisaid_epi_isl = Column(String, nullable=True)
    date = Column(DateTime, nullable=True)
    region = Column(
        String, nullable=True
    )  # Can be a value outside our RegionTable enum
    country = Column(String, nullable=True)
    division = Column(String, nullable=True)
    location = Column(String, nullable=True)
