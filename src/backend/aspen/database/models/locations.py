from sqlalchemy import Column, String

from aspen.database.models.base import idbase
from aspen.database.models.mixins import DictMixin


class Location(idbase, DictMixin):  # type: ignore
    """List of supported DPH/Sample locations, imported from Gisaid"""

    __tablename__ = "locations"

    region = Column(String, nullable=True)
    country = Column(String, nullable=True)
    division = Column(String, nullable=True)
    location = Column(String, nullable=True)
