# from sqlalchemy.ext.asyncio import AsyncSession

import asyncio
from pathlib import Path

import sqlalchemy as sa
from oso import Oso
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from sqlalchemy_oso import async_authorized_sessionmaker, register_models

from aspen.api.settings import Settings
from aspen.database.connection import init_async_db
from aspen.database.models import (
    Group,
    GroupRole,
    PhyloRun,
    PhyloTree,
    Role,
    Sample,
    User,
)
from aspen.database.models.base import base, idbase


async def get_samples(oso, user, engine):
    authsess = async_authorized_sessionmaker(
        bind=engine,
        get_oso=lambda: oso,
        get_user=lambda: user,
        get_checked_permissions=lambda: {Sample: "write"},
        class_=AsyncSession,
    )
    asess = authsess()
    rows = (await asess.execute(sa.select(Sample))).scalars().all()
    for row in rows:
        print(row.private_identifier)
    await asess.close()


async def get_phylo_runs(oso, user, engine):
    authsess = async_authorized_sessionmaker(
        bind=engine,
        get_oso=lambda: oso,
        get_user=lambda: user,
        get_checked_permissions=lambda: {PhyloRun: "read"},
        class_=AsyncSession,
    )
    asess = authsess()
    rows = (await asess.execute(sa.select(PhyloRun))).scalars().all()
    for row in rows:
        print(row.name, row.group_id)
    await asess.close()


async def get_phylo_trees(oso, user, engine):
    authsess = async_authorized_sessionmaker(
        bind=engine,
        get_oso=lambda: oso,
        get_user=lambda: user,
        get_checked_permissions=lambda: {PhyloTree: "read"},
        class_=AsyncSession,
    )
    asess = authsess()
    rows = (await asess.execute(sa.select(PhyloTree))).scalars().all()
    for row in rows:
        print(row.name)
    await asess.close()


async def select_related_run(session):
    rows = (
        (
            await session.execute(
                sa.select(PhyloTree).filter(PhyloTree.entity_id == 1645)
                # .options(joinedload(PhyloTree.phylo_run))
            )
        )
        .scalars()
        .all()
    )
    print()
    print("====")
    for row in rows:
        print(row.phylo_run.workflow_id)
    return


async def do_stuff():
    oso = Oso()
    register_models(oso, idbase)
    register_models(oso, base)
    oso.load_files([Path.joinpath(Path(__file__).parent.absolute(), "policy.polar")])

    settings = Settings()
    db = init_async_db(settings.DB_DSN)
    session = db.make_session()
    user = (await session.execute(sa.select(User).where(User.id == 36))).scalars().one()
    print(user)

    # await select_related_run(session)
    await get_samples(oso, user, db.engine)
    await get_phylo_runs(oso, user, db.engine)
    await get_phylo_trees(oso, user, db.engine)

    await session.close()
    await db.engine.dispose()


if __name__ == "__main__":
    asyncio.run(do_stuff())
