import re

import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.api.deps import get_db
from aspen.api.schemas.pango_lineages import PangoLineagesResponse
from aspen.database.models import PangoLineage

router = APIRouter()


@router.get("/pango", response_model=PangoLineagesResponse)
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
    all_lineages = set(result.scalars().all())

    all_lineages.update(
        [re.sub(r"(?<=\.)[0-9]+$", "*", lineage) for lineage in all_lineages]
    )

    all_lineages_list = list(all_lineages)
    all_lineages_list.sort()

    return {"lineages": all_lineages_list}
