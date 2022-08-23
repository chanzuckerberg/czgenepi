import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.api.authn import get_auth_user
from aspen.api.deps import get_db
from aspen.api.schemas.pathogens import PathogenResponse, PathogensResponse
from aspen.database.models import Pathogen, User

router = APIRouter()


@router.get("/", response_model=PathogensResponse)
async def list_pathogens(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_auth_user),
) -> PathogensResponse:
    query = sa.select(Pathogen)
    results = await db.execute(query)
    pathogens = [PathogenResponse.from_orm(row) for row in results.scalars()]
    return PathogensResponse.parse_obj({"pathogens": pathogens})
