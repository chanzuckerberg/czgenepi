# the main models in the database
from sqlalchemy import Boolean, Column, ForeignKey, Integer, MetaData, String
from sqlalchemy.ext.declarative import declarative_base, DeclarativeMeta
from sqlalchemy.orm import backref, relationship

from . import modelmixins as mx

meta = MetaData(
    schema="covidr",
    naming_convention={
        "ix": "ix_%(column_0_label)s",
        "uq": "uq_%(table_name)s_%(column_0_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "pk": "pk_%(table_name)s",
    },
)
# typing "base" as DeclarativeMeta is the ugly workaround for
# https://github.com/python/mypy/issues/2477
base: DeclarativeMeta = declarative_base(cls=mx.BaseMixin, metadata=meta)


class Group(base):
    """A group of users, generally a department of public health."""

    __tablename__ = "groups"

    name = Column(String, unique=True, nullable=False)

    def __repr__(self):
        return f"Group <{self.name}>"


class User(base):
    """A user."""

    __tablename__ = "users"

    name = Column(String, nullable=False)
    auth0_user_id = Column(String, unique=True, nullable=False)
    group_admin = Column(Boolean, nullable=False)
    system_admin = Column(Boolean, nullable=False)

    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    group = relationship(Group, backref=backref("users", uselist=True))

    def __repr__(self):
        return f"User <{self.name}>"
