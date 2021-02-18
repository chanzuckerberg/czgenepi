from contextlib import contextmanager

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


# TODO: add back in Config type hint and resolve circular dependency
def get_db_uri(runtime_config, readonly: bool = False) -> str:
    """Provides a URI for the database based on a runtime environment.

    Parameters
    ----------
    runtime_config : Config
        The runtime config that contains the database we want to access.
    readonly : bool
        Returns a read-only handle for the database if True. (default: False)

    Returns
    -------
        string that can be used to connect to a postgres database
    """
    if readonly:
        try:
            return runtime_config.DATABASE_CONFIG.READONLY_URI
        except NotImplementedError:
            raise ValueError(f"Config {runtime_config} does not have a read-only mode.")
    return runtime_config.DATABASE_CONFIG.URI
