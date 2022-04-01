import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.api.deps import get_db
from aspen.api.schemas.pango_lineages import PangoLineagesResponse
from aspen.database.models import PangoLineage

router = APIRouter()


@router.get("/", response_model=PangoLineagesResponse)
async def list_pango_lineages(db: AsyncSession = Depends(get_db)):
    """Gets all the Pango lineages.

    Note that the returned result is very simple: pretty  much just a list of
    strings. While we could return `id` information, the ids (at least with the
    current data workflow) are ephemeral and have no connection to the "real"
    lineage info. The only real info we have is the names of the lineages,
    so that's all we pull and return.
    """
    all_lineages_query = sa.select(PangoLineage.lineage)  # type: ignore
    result = await db.execute(all_lineages_query)
    return {"all_pango_lineages": result.scalars().all()}
