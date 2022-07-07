from __future__ import annotations

import random
import string
from collections.abc import MutableSequence
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Column, Date, ForeignKey, Integer, String, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import backref, relationship

from aspen.database.models.base import base, idbase
from aspen.database.models.locations import Location
from aspen.database.models.mixins import DictMixin

if TYPE_CHECKING:
    from aspen.database.models.cansee import CanSee


class Group(idbase, DictMixin):  # type: ignore
    """A group of users, generally a department of public health."""

    __tablename__ = "groups"

    name = Column(String, unique=True, nullable=False)
    address = Column(String, nullable=True)
    prefix = Column(
        String,
        unique=True,
        nullable=False,
        comment="used for creating public identifiers for samples",
    )
    division = Column(String, nullable=True)
    location = Column(String, nullable=True)

    auth0_org_id = Column(String, unique=True, nullable=False)

    # Default location context (int'l or division or location level)
    default_tree_location_id = Column(
        Integer,
        ForeignKey(Location.id),
        nullable=True,
    )
    default_tree_location = relationship("Location")  # type: ignore

    # Expected json structure:
    # { schedule_expression: list[int] }
    # where the list is days of the week as ints
    # where 0 is Monday and 6 is Sunday
    # e.g. [1, 3] for Tuesday and Thursday
    tree_parameters = Column(
        JSONB,
        nullable=True,
        default=text("'{}'::jsonb"),
        server_default=text("'{}'::jsonb"),
    )

    members = relationship("User", back_populates="group")  # type: ignore

    can_see: MutableSequence[CanSee]
    can_be_seen_by: MutableSequence[CanSee]

    def __repr__(self):
        return f"Group <{self.name}>"


def generate_split_id(length=20):
    possible_characters = string.ascii_lowercase + string.digits
    return "".join(random.choice(possible_characters) for _ in range(length))


class User(idbase, DictMixin):  # type: ignore
    """A user."""

    __tablename__ = "users"

    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    auth0_user_id = Column(String, unique=True, nullable=False)
    group_admin = Column(Boolean, nullable=False)
    system_admin = Column(Boolean, nullable=False)
    agreed_to_tos = Column(Boolean, nullable=False, default=False)
    # Date of policies (any of Privacy Policy, Terms of Service, etc, etc) the user
    # has last acknowledged. Used to display notification to user when policies change.
    acknowledged_policy_version = Column(Date, nullable=True, default=None)
    split_id = Column(String, nullable=False, default=generate_split_id)

    group_id = Column(Integer, ForeignKey(Group.id), nullable=False)
    group = relationship("Group", back_populates="members")  # type: ignore

    def __repr__(self):
        return f"User <{self.name}>"


class Role(idbase):  # type: ignore
    """Possible roles"""

    __tablename__ = "roles"
    name = Column(String, unique=True, nullable=False)


class UserRole(base):  # type: ignore
    """User role grants"""

    __tablename__ = "user_roles"
    role_id = Column(Integer, ForeignKey(Role.id), nullable=False)
    role = relationship(Role, backref=backref("user_roles", uselist=True))  # type: ignore
    group_id = Column(Integer, ForeignKey(Group.id), nullable=False, primary_key=True)
    group = relationship(Group, backref=backref("user_roles", uselist=True))  # type: ignore
    user_id = Column(Integer, ForeignKey(User.id), nullable=False, primary_key=True)
    user = relationship(User, backref=backref("user_roles", uselist=True))  # type: ignore


class GroupRole(base):  # type: ignore
    """Group role grants"""

    __tablename__ = "group_roles"
    role_id = Column(Integer, ForeignKey(Role.id), nullable=False)
    role = relationship(Role, backref=backref("group_roles", uselist=True))  # type: ignore
    grantor_group_id = Column(
        Integer, ForeignKey(Group.id), nullable=False, primary_key=True
    )
    grantor_group = relationship(Group, foreign_keys=[grantor_group_id], backref=backref("grantor_roles", uselist=True))  # type: ignore
    grantee_group_id = Column(
        Integer, ForeignKey(Group.id), nullable=False, primary_key=True
    )
    grantee_group = relationship(Group, foreign_keys=[grantee_group_id], backref=backref("grantee_roles", uselist=True))  # type: ignore
