import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.api.deps import get_db
from aspen.database.models import PangoLineages
from aspen.api.schemas.pango_lineages import PangoLineagesResponse

router = APIRouter()


@router.get("/", response_model=PangoLineagesResponse)
async def list_pango_lineages(db: AsyncSession = Depends(get_db)):
    """TODO DOCME"""
    all_lineages_query = sa.select(PangoLineages.lineage)
    result = await db.execute(all_lineages_query)
    return {"all_pango_lineages": result.scalars().all()}
