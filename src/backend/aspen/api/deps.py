from typing import AsyncGenerator

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

from aspen.api.settings import Settings
from aspen.database.connection import init_async_db


def get_auth0_client(request: Request):
    # This parameter is added to the app when we instantiate it.
    return request.app.state.auth0_client


def get_settings(request: Request):
    # This parameter is added to the app when we instantiate it.
    settings = request.app.state.aspen_settings
    return settings


async def get_db(
    request: Request, settings: Settings = Depends(get_settings)
) -> AsyncGenerator[AsyncSession, None]:
    """Store db session in the context var and reset it"""
    db = init_async_db(settings.DB_DSN)
    session = db.make_session()
    try:
        yield session
    finally:
        await session.close()  # type: ignore
