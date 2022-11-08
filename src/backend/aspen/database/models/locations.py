from sqlalchemy import Column, Float, String, UniqueConstraint

from aspen.database.models.base import idbase
from aspen.database.models.mixins import BaseMixin, DictMixin


class Location(idbase, BaseMixin, DictMixin):  # type: ignore
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
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
