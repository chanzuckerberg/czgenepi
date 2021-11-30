from sqlalchemy import Column, String, UniqueConstraint

from aspen.database.models.base import idbase
from aspen.database.models.mixins import DictMixin


class Location(idbase, DictMixin):  # type: ignore
    """List of supported DPH/Sample locations, imported from Gisaid"""

    __tablename__ = "locations"
    __table_args__ = (
        UniqueConstraint(
            "region", "country", "division", "location", name="uq_locations_cols"
        ),
    )

    region = Column(String, nullable=True)
    country = Column(String, nullable=True)
    division = Column(String, nullable=True)
    location = Column(String, nullable=True)
