from contextlib import contextmanager

from covidr.sandbox.runtimeenvironment import RuntimeEnvironment
from sqlalchemy.engine import create_engine, Engine
from sqlalchemy.orm import Session, sessionmaker


class SqlAlchemyInterface:
    def __init__(self, engine: Engine):
        self._engine = engine
        self._session_maker = sessionmaker(bind=engine)

    @property
    def engine(self) -> Engine:
        return self._engine

    def make_session(self) -> Session:
        return self._session_maker()


def init_db(db_uri: str) -> SqlAlchemyInterface:
    engine = create_engine(db_uri)
    return SqlAlchemyInterface(engine)


@contextmanager
def session_scope(interface: SqlAlchemyInterface):
    """Provide a transactional scope around a series of operations."""
    session = interface.make_session()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def get_db_uri(runtime_environment: RuntimeEnvironment, readonly: bool = False) -> str:
    """Provides a URI for the database based on a runtime environment.

    Parameters
    ----------
    runtime_environment : RuntimeEnvironment
        The runtime environment tha contains the database we want to access.
    readonly : bool
        Returns a read-only handle for the database if True. (default: False)

    Returns
    -------
        string that can be used to connect to a postgres database
    """
    if readonly and not runtime_environment.has_readonly:
        raise ValueError(
            f"RuntimeEnvironment {runtime_environment} does not have a read-only mode."
        )
    # TODO: replace with fetch from AWS secrets.
    assert runtime_environment == RuntimeEnvironment.LOCAL
    return "postgresql://user_rw:password_rw@localhost:5432/covidr_db"
