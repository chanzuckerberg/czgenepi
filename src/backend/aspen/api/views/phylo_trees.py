from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

from aspen.api.auth import get_auth_user
from aspen.api.deps import get_db, get_settings
from aspen.api.settings import Settings
from aspen.api.utils import process_phylo_tree
from aspen.database.models import User

router = APIRouter()


@router.get("/{item_id}/download")
async def get_single_phylo_tree(
    item_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
):
    phylo_tree_data = await process_phylo_tree(
        db, user, item_id, request.query_params.get("id_style")
    )
    headers = {
        "Content-Type": "application/json",
        "Content-Disposition": f"attachment; filename={item_id}.json",
    }
    return JSONResponse(content=phylo_tree_data, headers=headers)
