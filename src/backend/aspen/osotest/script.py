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
    permission = "write"
    print()
    print(f"Samples {permission}")
    print("====")
    authsess = async_authorized_sessionmaker(
        bind=engine,
        get_oso=lambda: oso,
        get_user=lambda: user,
        get_checked_permissions=lambda: {Sample: permission},
        class_=AsyncSession,
    )
    asess = authsess()
    rows = (await asess.execute(sa.select(Sample))).scalars().all()
    for row in rows:
        print(row.id, row.private_identifier)
    await asess.close()


async def get_phylo_runs(oso, user, engine):
    permission = "read"
    print()
    print(f"Phylo Runs {permission}")
    print("====")
    authsess = async_authorized_sessionmaker(
        bind=engine,
        get_oso=lambda: oso,
        get_user=lambda: user,
        get_checked_permissions=lambda: {PhyloRun: permission},
        class_=AsyncSession,
    )
    asess = authsess()
    rows = (await asess.execute(sa.select(PhyloRun))).scalars().all()
    for row in rows:
        print(row.id, row.name, row.group_id)
    await asess.close()


async def get_phylo_trees(oso, user, engine):
    permission = "read"
    print()
    print(f"Phylo Trees {permission}")
    print("====")
    authsess = async_authorized_sessionmaker(
        bind=engine,
        get_oso=lambda: oso,
        get_user=lambda: user,
        get_checked_permissions=lambda: {PhyloTree: permission},
        class_=AsyncSession,
    )
    asess = authsess()
    rows = (await asess.execute(sa.select(PhyloTree))).scalars().all()
    for row in rows:
        print(row.id, row.name)
    await asess.close()


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

    await get_samples(oso, user, db.engine)
    await get_phylo_runs(oso, user, db.engine)
    await get_phylo_trees(oso, user, db.engine)

    await session.close()
    await db.engine.dispose()


if __name__ == "__main__":
    asyncio.run(do_stuff())
