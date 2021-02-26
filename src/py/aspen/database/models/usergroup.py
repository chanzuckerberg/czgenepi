from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import backref, relationship

from aspen.database.models.base import idbase
from aspen.database.models.mixins import DictMixin


class Group(idbase, DictMixin):
    """A group of users, generally a department of public health."""

    __tablename__ = "groups"

    name = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    address = Column(String, nullable=True)

    def __repr__(self):
        return f"Group <{self.name}>"


class User(idbase, DictMixin):
    """A user."""

    __tablename__ = "users"

    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    auth0_user_id = Column(String, unique=True, nullable=False)
    group_admin = Column(Boolean, nullable=False)
    system_admin = Column(Boolean, nullable=False)

    group_id = Column(Integer, ForeignKey(Group.id), nullable=False)
    group = relationship(Group, backref=backref("users", uselist=True))

    def __repr__(self):
        return f"User <{self.name}>"
