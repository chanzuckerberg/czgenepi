from __future__ import annotations

import random
import string

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    func,
    Index,
    Integer,
    String,
    text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.engine.default import DefaultExecutionContext
from sqlalchemy.orm import backref, relationship

from aspen.database.models.base import base, idbase
from aspen.database.models.locations import Location
from aspen.database.models.mixins import DictMixin


def submitting_lab_default(context: DefaultExecutionContext) -> str:
    # mypy complains, but yes this class has this method
    return context.get_current_parameters()["name"]  # type: ignore


class Group(idbase, DictMixin):  # type: ignore
    """A group of users, generally a department of public health."""

    __tablename__ = "groups"

    name = Column(String, unique=True, nullable=False)
    submitting_lab = Column(String, nullable=True, default=submitting_lab_default)
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
        nullable=False,
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

    def __repr__(self):
        return f"Group <{self.name}>"


def generate_random_id(length=20):
    """Generates random id for cases we need de-identified ID for user"""
    possible_characters = string.ascii_lowercase + string.digits
    return "".join(random.choice(possible_characters) for _ in range(length))


class User(idbase, DictMixin):  # type: ignore
    """A user."""

    __tablename__ = "users"
    __table_args__ = (
        # For historical reasons, split_id uniqueness is via unique index
        # rather than direct unique constraint on Column. Same effect though.
        Index("uq_users_split_id", "split_id", unique=True),
    )

    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    auth0_user_id = Column(String, unique=True, nullable=False)
    # Users did not originally have `created_at` in DB. Users created prior
    # to Oct 2022 will have a NULL value.
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    system_admin = Column(Boolean, nullable=False)
    agreed_to_tos = Column(Boolean, nullable=False, default=False)
    # Date of policies (any of Privacy Policy, Terms of Service, etc, etc) the user
    # has last acknowledged. Used to display notification to user when policies change.
    acknowledged_policy_version = Column(Date, nullable=True, default=None)
    # `split_id` is unique, but set via index, rather than Column, see above.
    split_id = Column(String, default=generate_random_id)
    # `analytics_id` used for keeping users anonymized for analytics
    analytics_id = Column(
        String, unique=True, nullable=False, default=generate_random_id
    )
    gisaid_submitter_id = Column(String, nullable=True, default=None)

    def __repr__(self):
        return f"User <{self.name}>"


class Role(idbase):  # type: ignore
    """Possible roles"""

    __tablename__ = "roles"
    name = Column(String, unique=True, nullable=False)


class UserRole(base):  # type: ignore
    """User role grants"""

    __tablename__ = "user_roles"
    __table_args__ = (
        UniqueConstraint(
            "user_id", "group_id", "role_id", name="uq_user_roles_user_group_role"
        ),
    )
    role_id = Column(
        Integer, ForeignKey(Role.id), nullable=False, primary_key=True, index=True
    )
    role = relationship(Role, backref=backref("user_roles", uselist=True))  # type: ignore
    group_id = Column(
        Integer, ForeignKey(Group.id), nullable=False, primary_key=True, index=True
    )
    group = relationship(Group, backref=backref("user_roles", uselist=True))  # type: ignore
    user_id = Column(
        Integer, ForeignKey(User.id), nullable=False, primary_key=True, index=True
    )
    user = relationship(User, backref=backref("user_roles", uselist=True))  # type: ignore


class GroupRole(base):  # type: ignore
    """Group role grants"""

    __tablename__ = "group_roles"
    __table_args__ = (
        UniqueConstraint(
            "grantee_group_id",
            "grantor_group_id",
            "role_id",
            name="uq_group_roles_grantee_grantor_role",
        ),
    )
    role_id = Column(Integer, ForeignKey(Role.id), nullable=False, index=True)
    role = relationship(Role, backref=backref("group_roles", uselist=True))  # type: ignore
    grantor_group_id = Column(
        Integer, ForeignKey(Group.id), nullable=False, primary_key=True, index=True
    )
    grantor_group = relationship(Group, foreign_keys=[grantor_group_id], backref=backref("grantor_roles", uselist=True))  # type: ignore
    grantee_group_id = Column(
        Integer, ForeignKey(Group.id), nullable=False, primary_key=True, index=True
    )
    grantee_group = relationship(Group, foreign_keys=[grantee_group_id], backref=backref("grantee_roles", uselist=True))  # type: ignore
