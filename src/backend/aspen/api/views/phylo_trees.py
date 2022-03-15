import sqlalchemy as sa
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, contains_eager
from starlette.requests import Request

from aspen.api.auth import get_auth_user
from aspen.api.deps import get_db, get_settings
from aspen.api.settings import Settings
from aspen.api.utils import extract_accessions, MetadataTSVStreamer, process_phylo_tree
from aspen.database.models import (
    PhyloRun,
    PhyloTree,
    Sample,
    UploadedPathogenGenome,
    User,
)

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


# supporting function for get_tree_metadata()
async def _get_selected_samples(db: AsyncSession, phylo_tree_id: int):
    # SqlAlchemy requires aliasing for any queries that join to the same table (in this case, entities)
    # multiple times via joined table inheritance
    # ref: https://github.com/sqlalchemy/sqlalchemy/discussions/6972
    entity_alias = aliased(UploadedPathogenGenome, flat=True)
    phylo_tree_query = (
        sa.select(PhyloTree)  # type: ignore
        .join(PhyloRun, PhyloTree.producing_workflow.of_type(PhyloRun))  # type: ignore
        .outerjoin(entity_alias, PhyloRun.inputs.of_type(entity_alias))  # type: ignore
        .outerjoin(Sample)  # type: ignore
        .filter(PhyloTree.entity_id == phylo_tree_id)
        .options(
            contains_eager(PhyloTree.producing_workflow.of_type(PhyloRun))
            .contains_eager(PhyloRun.inputs.of_type(entity_alias))
            .contains_eager(entity_alias.sample)
        )
    )
    phylo_tree_result = await db.execute(phylo_tree_query)
    phylo_tree: PhyloTree = phylo_tree_result.unique().scalars().one()

    phylo_run = phylo_tree.producing_workflow
    selected_samples = set(phylo_run.gisaid_ids)
    for uploaded_pathogen_genome in phylo_run.inputs:
        sample = uploaded_pathogen_genome.sample
        selected_samples.add(sample.public_identifier.replace("hCoV-19/", ""))
        selected_samples.add(sample.private_identifier)
    return selected_samples


@router.get("/{item_id}/sample_ids")
async def get_tree_metadata(
    item_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
):
    phylo_tree_data = await process_phylo_tree(
        db, user, item_id, request.query_params.get("id_style")
    )
    accessions = extract_accessions([], phylo_tree_data["tree"])
    selected_samples = await _get_selected_samples(db, item_id)

    filename: str = f"{item_id}_sample_ids.tsv"
    streamer = MetadataTSVStreamer(filename, accessions, selected_samples)
    return streamer.get_response()
