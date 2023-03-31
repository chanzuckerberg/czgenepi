from operator import and_
from typing import AsyncGenerator

import sqlalchemy as sa
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import contains_eager
from sqlalchemy.orm.exc import NoResultFound
from starlette.requests import Request

from aspen.api.error import http_exceptions as ex
from aspen.api.settings import APISettings
from aspen.database.connection import init_async_db, SqlAlchemyInterface
from aspen.database.models import Pathogen
from aspen.database.models.pathogens import PathogenRepoConfig
from aspen.database.models.public_repositories import PublicRepository
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
    request: Request, settings: APISettings = Depends(get_settings)
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


def get_pathogen_slug(pathogen_slug=None):
    # get pathogen slug from URL
    if pathogen_slug is None:
        return "SC2"
    return pathogen_slug


async def get_pathogen(
    slug: str = Depends(get_pathogen_slug), db: AsyncSession = Depends(get_db)
) -> Pathogen:
    try:
        return await Pathogen.get_by_slug(db, slug)
    except NoResultFound:
        raise ex.BadRequestException("Invalid pathogen slug")


async def get_public_repository(
    pathogen: Pathogen = Depends(get_pathogen),
    db: AsyncSession = Depends(get_db),
    split_client: SplitClient = Depends(get_splitio),
) -> PublicRepository:
    preferred_public_db = split_client.get_pathogen_treatment(
        "PATHOGEN_public_repository", pathogen
    )

    try:
        repo = (await db.execute(sa.select(PublicRepository).filter_by(name=preferred_public_db))).scalars().one()  # type: ignore
        return repo
    except NoResultFound:
        raise ex.BadRequestException("Invalid public repository")


async def get_contextual_repository(
    pathogen: Pathogen = Depends(get_pathogen),
    db: AsyncSession = Depends(get_db),
    split_client: SplitClient = Depends(get_splitio),
) -> PublicRepository:
    preferred_public_db = split_client.get_pathogen_treatment(
        "PATHOGEN_contextual_repository", pathogen
    )

    try:
        repo = (await db.execute(sa.select(PublicRepository).filter_by(name=preferred_public_db))).scalars().one()  # type: ignore
        return repo
    except NoResultFound:
        raise ex.BadRequestException("Invalid public repository")


async def get_pathogen_repo_config(
    splitio: SplitClient = Depends(get_splitio),
    pathogen: Pathogen = Depends(get_pathogen),
    db: AsyncSession = Depends(get_db),
):
    preferred_public_db = splitio.get_pathogen_treatment(
        "PATHOGEN_public_repository", pathogen
    )

    q = (
        sa.select(PathogenRepoConfig)  # type: ignore
        .join(PathogenRepoConfig.public_repository)
        .join(PathogenRepoConfig.pathogen)
        .options(
            contains_eager(PathogenRepoConfig.public_repository),
            contains_eager(PathogenRepoConfig.pathogen),
        )
        .filter(
            and_(
                PathogenRepoConfig.pathogen == pathogen,
                PublicRepository.name == preferred_public_db,
            )
        )
    )
    res = await db.execute(q)
    pathogen_repo_config = res.scalars().one_or_none()
    if pathogen_repo_config is None:
        raise ex.ServerException(
            "no public repository found for given pathogen public repository"
        )

    return pathogen_repo_config
