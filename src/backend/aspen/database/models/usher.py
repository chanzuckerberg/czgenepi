"""Models for handling anything related to UShER"""
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from aspen.database.models.base import idbase
from aspen.database.models.mixins import DictMixin
from aspen.database.models.pathogens import Pathogen


class UsherOption(idbase, DictMixin):  # type: ignore
    """A possible tree creation option when using UShER."""

    __tablename__ = "usher_options"

    description = Column(String, unique=True, nullable=False)
    value = Column(String, unique=True, nullable=False)
    # `priority` is order we display options to user. LOWEST number is max priority.
    priority = Column(Integer, unique=True)
    pathogen_id = Column(
        Integer, ForeignKey(Pathogen.id), nullable=False
    )
    pathogen: Pathogen = relationship(Pathogen, back_populates="usher_options")  # type: ignore

    def __repr__(self):
        return f"UsherOption <{self.value}>"
