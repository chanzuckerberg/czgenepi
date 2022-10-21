"""SQLAlchemy session classes and factories for oso."""
from typing import Any, Callable, Dict, Optional, Type
import logging

from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import orm

from oso import Oso

from sqlalchemy_oso.compat import USING_SQLAlchemy_v1_3

logger = logging.getLogger(__name__)


class _OsoSession:
    set = False

    @classmethod
    def get(cls):
        session = cls._get()
        new_session = Session(bind=session.bind)
        return new_session

    @classmethod
    def set_get_session(cls, get_session):
        cls.set = True
        _OsoSession._get = get_session


def set_get_session(oso: Oso, get_session_func):
    """Set the function that oso uses to expose a SQLAlchemy session to the policy

    :param oso: The Oso instance used to evaluate the policy.
    :type oso: Oso

    :param get_session_func: A function that returns a SQLAlchemy session
    :type get_session_func: lambda

    The session can be accessed from polar via the OsoSession constant. E.g.,

    .. code-block:: polar

        OsoSession.get().query(...)
    """
    _OsoSession.set_get_session(get_session_func)
    oso.register_constant(_OsoSession, "OsoSession")


Permissions = Optional[Dict[Type[Any], Any]]


def authorized_sessionmaker(
    get_oso: Callable[[], Oso],
    get_user: Callable[[], Any],
    get_checked_permissions: Callable[[], Permissions],
    class_: Type[Session] = None,
    **kwargs,
):
    """Session factory for sessions with Oso authorization applied.

    :param get_oso: Callable that returns the Oso instance to use for
                    authorization.
    :param get_user: Callable that returns the user for an authorization
                     request.
    :param get_checked_permissions: Callable that returns an optional map of
                                    permissions (resource-action pairs) to
                                    authorize for the session. If the callable
                                    returns ``None``, no authorization will
                                    be applied to the session. If a map of
                                    permissions is provided, querying for
                                    a SQLAlchemy model present in the map
                                    will authorize results according to the
                                    action specified as the value in the
                                    map. E.g., providing a map of ``{Post:
                                    "read", User: "view"}`` where ``Post`` and
                                    ``User`` are SQLAlchemy models will apply
                                    authorization to ``session.query(Post)``
                                    and ``session.query(User)`` such that
                                    only ``Post`` objects that the user can
                                    ``"read"`` and ``User`` objects that the
                                    user can ``"view"`` are fetched from the
                                    database.
    :param class_: Base class to use for sessions.

    All other keyword arguments are passed through to
    :py:func:`sqlalchemy.orm.session.sessionmaker` unchanged.

    **Invariant**: the values returned by the `get_oso()`, `get_user()`, and
    `get_checked_permissions()` callables provided to this function *must
    remain fixed for a given session*. This prevents authorization responses
    from changing, ensuring that the session's identity map never contains
    unauthorized objects.

    NOTE: _baked_queries are disabled on SQLAlchemy 1.3 since the caching
          mechanism can bypass authorization by using queries from the cache
          that were previously baked without authorization applied. Note that
          _baked_queries are deprecated as of SQLAlchemy 1.4.
    .. _baked_queries: https://docs.sqlalchemy.org/en/14/orm/extensions/baked.html
    """
    if class_ is None:
        class_ = Session

    # Oso, user, and checked permissions must remain unchanged for the entire
    # session. This is to prevent unauthorized objects from ending up in the
    # session's identity map.
    class Sess(AuthorizedSessionBase, class_):  # type: ignore
        def __init__(self, **options):
            options.setdefault("oso", get_oso())
            options.setdefault("user", get_user())
            options.setdefault("checked_permissions", get_checked_permissions())
            super().__init__(**options)

    session = type("Session", (Sess,), {})

    # We call sessionmaker here because sessionmaker adds a configure
    # method to the returned session and we want to replicate that
    # functionality.
    return sessionmaker(class_=session, **kwargs)


def scoped_session(
    get_oso: Callable[[], Oso],
    get_user: Callable[[], Any],
    get_checked_permissions: Callable[[], Permissions],
    scopefunc: Optional[Callable[..., Any]] = None,
    **kwargs,
):
    """Return a scoped session maker that uses the Oso instance, user, and
    checked permissions (resource-action pairs) as part of the scope function.

    Use in place of sqlalchemy's scoped_session_.

    Uses :py:func:`authorized_sessionmaker` as the factory.

    :param get_oso: Callable that returns the Oso instance to use for
                    authorization.
    :param get_user: Callable that returns the user for an authorization
                     request.
    :param get_checked_permissions: Callable that returns an optional map of
                                    permissions (resource-action pairs) to
                                    authorize for the session. If the callable
                                    returns ``None``, no authorization will
                                    be applied to the session. If a map of
                                    permissions is provided, querying for
                                    a SQLAlchemy model present in the map
                                    will authorize results according to the
                                    action specified as the value in the
                                    map. E.g., providing a map of ``{Post:
                                    "read", User: "view"}`` where ``Post`` and
                                    ``User`` are SQLAlchemy models will apply
                                    authorization to ``session.query(Post)``
                                    and ``session.query(User)`` such that
                                    only ``Post`` objects that the user can
                                    ``"read"`` and ``User`` objects that the
                                    user can ``"view"`` are fetched from the
                                    database.
    :param scopefunc: Additional scope function to use for scoping sessions.
                      Output will be combined with the Oso, permissions
                      (resource-action pairs), and user objects.
    :param kwargs: Additional keyword arguments to pass to
                   :py:func:`authorized_sessionmaker`.

    NOTE: _baked_queries are disabled on SQLAlchemy 1.3 since the caching
          mechanism can bypass authorization by using queries from the cache
          that were previously baked without authorization applied. Note that
          _baked_queries are deprecated as of SQLAlchemy 1.4.

    .. _scoped_session: https://docs.sqlalchemy.org/en/13/orm/contextual.html

    .. _baked_queries: https://docs.sqlalchemy.org/en/14/orm/extensions/baked.html
    """
    scopefunc = scopefunc or (lambda: None)

    def _scopefunc():
        perms = get_checked_permissions()
        perms = frozenset() if perms is None else frozenset(perms.items())
        return (get_oso(), perms, get_user(), scopefunc())

    factory = authorized_sessionmaker(
        get_oso, get_user, get_checked_permissions, **kwargs
    )

    return orm.scoped_session(factory, scopefunc=_scopefunc)


class AuthorizedSessionBase(object):
    """Mixin for SQLAlchemy Session that uses oso authorization for queries.

    Can be used to create a custom session class that uses oso::

        class MySession(AuthorizedSessionBase, sqlalchemy.orm.Session):
            pass

    NOTE: _baked_queries are disabled on SQLAlchemy 1.3 since the caching
          mechanism can bypass authorization by using queries from the cache
          that were previously baked without authorization applied. Note that
          _baked_queries are deprecated as of SQLAlchemy 1.4.

    .. _baked_queries: https://docs.sqlalchemy.org/en/14/orm/extensions/baked.html
    """

    def __init__(self, oso: Oso, user, checked_permissions: Permissions, **options):
        """Create an authorized session using ``oso``.

        :param oso: The Oso instance to use for authorization.
        :param user: The user to perform authorization for.
        :param checked_permissions: The permissions (resource-action pairs) to
                                    authorize.
        :param checked_permissions: An optional map of permissions
                                    (resource-action pairs) to authorize for
                                    the session. If ``None`` is provided,
                                    no authorization will be applied to
                                    the session. If a map of permissions
                                    is provided, querying for a SQLAlchemy
                                    model present in the map will authorize
                                    results according to the action
                                    specified as the value in the map. E.g.,
                                    providing a map of ``{Post: "read",
                                    User: "view"}`` where ``Post`` and
                                    ``User`` are SQLAlchemy models will apply
                                    authorization to ``session.query(Post)``
                                    and ``session.query(User)`` such that
                                    only ``Post`` objects that the user can
                                    ``"read"`` and ``User`` objects that the
                                    user can ``"view"`` are fetched from the
                                    database.
        :param options: Additional keyword arguments to pass to ``Session``.

        **Invariant**: the `oso`, `user`, and `checked_permissions` parameters
        *must remain fixed for a given session*. This prevents authorization
        responses from changing, ensuring that the session's identity map never
        contains unauthorized objects.
        """
        self._oso = oso
        self._oso_user = user
        self._oso_checked_permissions = checked_permissions

        if USING_SQLAlchemy_v1_3:  # Disable baked queries on SQLAlchemy 1.3.
            options["enable_baked_queries"] = False

        super().__init__(**options)  # type: ignore

    @property
    def oso_context(self):
        return {
            "oso": self._oso,
            "user": self._oso_user,
            "checked_permissions": self._oso_checked_permissions,
        }


class AuthorizedSession(AuthorizedSessionBase, Session):
    """SQLAlchemy session that uses oso for authorization.

    Queries on this session only return authorized objects.

    Usually :py:func:`authorized_sessionmaker` is used instead of directly
    instantiating the session.

    NOTE: _baked_queries are disabled on SQLAlchemy 1.3 since the caching
          mechanism can bypass authorization by using queries from the cache
          that were previously baked without authorization applied. Note that
          _baked_queries are deprecated as of SQLAlchemy 1.4.

    .. _baked_queries: https://docs.sqlalchemy.org/en/14/orm/extensions/baked.html
    """

    pass
