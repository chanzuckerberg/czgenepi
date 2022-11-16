import re

import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from aspen.api.deps import get_db
from aspen.api.schemas.lineages import PathogenLineagesResponse
from aspen.database.models import PathogenLineage
from aspen.util.lineage import NEXTSTRAIN_LINEAGE_MAP, WHO_LINEAGE_MAP

router = APIRouter()


@router.get("/pango", response_model=PathogenLineagesResponse)
async def list_pango_lineages(db: AsyncSession = Depends(get_db)):
    """Gets all the Pango lineages.

    Note that the returned result is very simple: pretty  much just a list of
    strings. While we could return `id` information, the ids (at least with the
    current data workflow) are ephemeral and have no connection to the "real"
    lineage info. The only real info we have is the names of the lineages,
    so that's all we pull and return.
    """
    # This is specifically a *pangolin* lineages endpoint, so hardcode an SC2 filter
    all_lineages_query = sa.select(PathogenLineage.lineage).options(joinedload(Pathogen)).where(Pathogen.slug == "SC2")  # type: ignore
    result = await db.execute(all_lineages_query)
    all_lineages = set(result.scalars().all())

    all_lineages.update(
        [re.sub(r"\.[0-9]+$", "*", lineage) for lineage in all_lineages]
    )
    all_lineages.update(WHO_LINEAGE_MAP.keys())

    all_lineages_list = [
        f"{lineage} / {NEXTSTRAIN_LINEAGE_MAP[lineage]}"
        if lineage in NEXTSTRAIN_LINEAGE_MAP
        else lineage
        for lineage in all_lineages
    ]
    all_lineages_list.sort()

    return {"lineages": all_lineages_list}
