import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import contains_eager
from sqlalchemy.sql.expression import and_

from aspen.database.models import Pathogen, PathogenRepoConfig, PublicRepository


async def get_pathogen_repo_config_for_pathogen(
    pathogen: Pathogen, preferred_public_database: str, db: AsyncSession
):

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
                PublicRepository.name == preferred_public_database,
            )
        )
    )
    res = await db.execute(q)
    pathogen_repo_config = res.scalars().one_or_none()

    return pathogen_repo_config
