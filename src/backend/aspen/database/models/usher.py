"""Models for handling anything related to UShER"""
from sqlalchemy import Column, Integer, String

from aspen.database.models.base import idbase
from aspen.database.models.mixins import DictMixin


class UsherOption(idbase, DictMixin):  # type: ignore
    """A possible tree creation option when using UShER."""

    __tablename__ = "usher_options"

    description = Column(String, unique=True, nullable=False)
    value = Column(String, unique=True, nullable=False)
    # `priority` is order we display options to user. LOWEST number is max priority.
    priority = Column(Integer, unique=True)

    def __repr__(self):
        return f"UsherOption <{self.value}>"
