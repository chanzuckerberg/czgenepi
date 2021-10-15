from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

from aspen.api.settings import get_settings
from aspen.database.connection import init_async_db


async def get_db(request: Request) -> AsyncGenerator[AsyncSession, None]:
    """Store db session in the context var and reset it"""
    settings = get_settings()
    db = init_async_db(settings.DB_DSN)
    session = db.make_session()
    try:
        yield session
    finally:
        session.close()
