# from sqlalchemy.ext.asyncio import AsyncSession

import asyncio

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy_oso import async_authorized_sessionmaker, register_models

from aspen.api.settings import Settings
from aspen.database.connection import init_async_db
from aspen.database.models import Group, Sample, User
from aspen.database.models.base import idbase
from oso import Oso


async def do_stuff():

    oso = Oso()
    register_models(oso, idbase)
    oso.load_files(["policy.polar"])

    settings = Settings()
    db = init_async_db(settings.DB_DSN)
    session = db.make_session()
    user = (await session.execute(sa.select(User).where(User.id == 36))).scalars().one()
    print(user)
    authsess = async_authorized_sessionmaker(
        bind=db.engine,
        get_oso=lambda: oso,
        get_user=lambda: user,
        get_checked_permissions=lambda: {Sample: "read"},
        class_=AsyncSession,
    )
    asess = authsess()
    samples = (await asess.execute(sa.select(Sample))).scalars().all()
    for sample in samples:
        print(sample)

    await asess.close()
    await session.close()
    await db.engine.dispose()


if __name__ == "__main__":
    asyncio.run(do_stuff())
