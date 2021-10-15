from contextvars import ContextVar
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

from aspen.api.settings import get_settings
from aspen.database.connection import init_async_db

session_context_var: ContextVar[Optional[AsyncSession]] = ContextVar(
    "_session", default=None
)


async def get_db(request: Request):
    """Store db session in the context var and reset it"""
    print("==== GETTING DB!")
    settings = get_settings()
    db = init_async_db(settings.DB_DSN)
    session = db.make_session()
    token = session_context_var.set(session)
    try:
        yield session
    finally:
        await session.close()
        session_context_var.reset(token)
