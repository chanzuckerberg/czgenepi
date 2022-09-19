import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from sqlalchemy.sql.expression import and_

from aspen.database.models import Pathogen, PathogenRepoConfig, PublicRepository


async def get_public_repository_prefix(pathogen: Pathogen, public_repository_name, db):
    if public_repository_name:
        # only get the prefix if we have enough information to proceed
        prefix = (
            sa.select(PathogenRepoConfig)  # type: ignore
            .join(PublicRepository)  # type: ignore
            .where(  # type: ignore
                and_(
                    PathogenRepoConfig.pathogen == pathogen,
                    PublicRepository.name == public_repository_name,
                )
            )
        )
        res = await db.execute(prefix)
        pathogen_repo_config = res.scalars().one_or_none()

        if pathogen_repo_config:
            return pathogen_repo_config.prefix


async def get_pathogen_repo_config_for_pathogen(
    pathogen: Pathogen, preferred_public_database: str, db: AsyncSession
):

    q = (
        sa.select(PathogenRepoConfig)  # type: ignore
        .options(  # type: ignore
            joinedload(PathogenRepoConfig.public_repository),
            joinedload(PathogenRepoConfig.pathogen),
        )
        .where(
            and_(
                PathogenRepoConfig.pathogen == pathogen,
                PathogenRepoConfig.public_repository.has(
                    PublicRepository.name == preferred_public_database
                ),
            )
        )
    )
    res = await db.execute(q)
    pathogen_repo_config = res.scalars().one_or_none()

    if pathogen_repo_config:
        return pathogen_repo_config
