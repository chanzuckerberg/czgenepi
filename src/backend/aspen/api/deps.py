from contextvars import ContextVar
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from aspen.database.connection import init_async_db

session_context_var: ContextVar[Optional[AsyncSession]] = ContextVar(
    "_session", default=None
)


async def set_db(settings):
    """Store db session in the context var and reset it"""
    db = init_async_db(settings.DB_DSN)
    session = db.make_session()
    token = session_context_var.set(session)
    try:
        yield
    finally:
        await session.close()
        session_context_var.reset(token)


def get_db():
    """Fetch db session from the context var"""
    session = session_context_var.get()
    if session is None:
        raise Exception("Missing session")
    return session

