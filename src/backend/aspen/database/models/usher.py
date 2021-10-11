"""Models for handling anything related to UShER"""
from sqlalchemy import Column, Integer, String

from aspen.database.models.base import idbase
from aspen.database.models.mixins import DictMixin


class UsherOption(idbase, DictMixin):  # type: ignore
    """DOCME"""

    __tablename__ = "usher_options"

    description = Column(String, unique=True, nullable=False)
    value = Column(String, unique=True, nullable=False)
    priority = Column(Integer, unique=True)

    def __repr__(self):
        return f"UsherOption <{self.value}>"
