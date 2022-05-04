from pathlib import Path

from fastapi import Depends
from oso import AsyncOso
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

from aspen.api.auth import get_auth_user
from aspen.api.deps import get_db
from aspen.database.models import User
from aspen.osotest2.async_sqlalchemy2_adapter import AsyncSqlAlchemyAdapter
from aspen.osotest2.polardb import register_classes


async def get_read_session(
    request: Request,
    session: AsyncSession = Depends(get_db),
    user: User = Depends(get_auth_user),
) -> AsyncOso:
    oso = AsyncOso()
    oso.set_data_filtering_adapter(AsyncSqlAlchemyAdapter(session))
    register_classes(oso)
    await oso.load_files(
        [Path.joinpath(Path(__file__).parent.absolute(), "policy.polar")]
    )
    return oso
