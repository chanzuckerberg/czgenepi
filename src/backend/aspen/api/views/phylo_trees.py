import sentry_sdk
import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, joinedload
from sqlalchemy.engine.result import ChunkedIteratorResult
from sqlalchemy.sql.selectable import Select

from aspen.api.auth import get_auth_user
from aspen.api.deps import get_db
from aspen.api.error import http_exceptions as ex
from aspen.database.models import PhyloTree, User, PhyloRun
from aspen.api.schemas.phylo_trees import PhyloTreeRequest, PhyloTreeResponse, Group

router = APIRouter()

@router.put("/")
async def update_phylo_tree(
    phylo_tree_request: PhyloTreeRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_auth_user),
):
    phylo_run_alias = aliased(PhyloRun)

    phylo_runs_query: Select = (
        sa.select(phylo_run_alias)  # type: ignore
        .options(
            joinedload(phylo_run_alias.outputs.of_type(PhyloTree)),
            joinedload(phylo_run_alias.group),
        )
        .filter(
            (PhyloTree.id == phylo_tree_request.id)
        )
    )

    phylo_run_results: ChunkedIteratorResult = await db.execute(phylo_runs_query)
    phylo_run: PhyloRun = phylo_run_results.unique().scalars().one()

    # check that user has permission to update PhyloTree name
    group: Group = user.group
    if phylo_run.group_id != group.id:
        if not user.system_admin:
            not_sufficient_permission_msg: str = f"User {user.name} from group {group.name} does not have permission to update tree name"
            sentry_sdk.capture_message(
                not_sufficient_permission_msg, "error"
            )
            raise ex.BadRequestException(not_sufficient_permission_msg)

    await db.execute(
        sa.update(PhyloTree).
        where(PhyloTree.id == phylo_tree_request.id).
        values(name=phylo_tree_request.name)
    )
    await db.commit()

    return PhyloTreeResponse(id=phylo_tree_request.id)




