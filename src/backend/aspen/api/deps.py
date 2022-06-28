from typing import AsyncGenerator

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

from aspen.api.settings import Settings
from aspen.database.connection import init_async_db, SqlAlchemyInterface
from aspen.util.split import SplitClient


def get_auth0_client(request: Request):
    # This parameter is added to the app when we instantiate it.
    return request.app.state.auth0_client


def get_settings(request: Request):
    # We stashed our settings object in app.state when we loaded the app, and every
    # request object has that app attached at request.app, so this dependency is just
    # returning the settings object we created at startup.
    settings = request.app.state.aspen_settings
    return settings


def get_splitio(request: Request) -> SplitClient:
    # We stashed this at startup the same way we did for settings.
    splitio = request.app.state.splitio
    return splitio


async def get_engine(
    request: Request, settings: Settings = Depends(get_settings)
) -> AsyncGenerator[SqlAlchemyInterface, None]:
    """Store db session in the context var and reset it"""
    engine = init_async_db(settings.DB_DSN)
    try:
        yield engine
    finally:
        pass


async def get_db(
    request: Request, engine: SqlAlchemyInterface = Depends(get_engine)
) -> AsyncGenerator[AsyncSession, None]:
    """Store db session in the context var and reset it"""
    session = engine.make_session()
    try:
        yield session
    finally:
        await session.close()  # type: ignore
