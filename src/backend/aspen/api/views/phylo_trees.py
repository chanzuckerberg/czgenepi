import re

import sqlalchemy as sa
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, contains_eager
from starlette.requests import Request

from aspen.api.authz import AuthZSession, get_authz_session
from aspen.api.deps import get_db, get_pathogen, get_splitio
from aspen.api.error import http_exceptions as ex
from aspen.api.utils import (
    extract_accessions,
    get_pathogen_repo_config_for_pathogen,
    MetadataTSVStreamer,
    process_phylo_tree,
)
from aspen.database.models import (
    Pathogen,
    PhyloRun,
    PhyloTree,
    Sample,
    UploadedPathogenGenome,
)
from aspen.database.models.pathogens import PathogenRepoConfig
from aspen.util.split import SplitClient

router = APIRouter()


@router.get("/{item_id}/download")
async def get_single_phylo_tree(
    item_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    az: AuthZSession = Depends(get_authz_session),
    pathogen: Pathogen = Depends(get_pathogen),
    splitio: SplitClient = Depends(get_splitio),
) -> JSONResponse:
    # get public repository for a given pathogen

    preferred_public_db = splitio.get_pathogen_treatment(
        "PATHOGEN_public_repository", pathogen
    )
    # get the pathogen_repo_config  for given public_repository and pathogen
    pathogen_repo_config = await get_pathogen_repo_config_for_pathogen(
        pathogen, preferred_public_db, db
    )
    if pathogen_repo_config is None:
        raise ex.ServerException(
            "no public repository found for given pathogen public repository"
        )
    phylo_tree_data = await process_phylo_tree(
        db,
        az,
        item_id,
        pathogen,
        pathogen_repo_config,
        request.query_params.get("id_style"),
    )
    headers = {
        "Content-Type": "application/json",
        "Content-Disposition": f"attachment; filename={item_id}.json",
    }
    return JSONResponse(content=phylo_tree_data, headers=headers)


# supporting function for get_tree_metadata()
async def _get_selected_samples(
    db: AsyncSession,
    phylo_tree_id: int,
    pathogen: Pathogen,
    pathogen_repo_config: PathogenRepoConfig,
):
    # SqlAlchemy requires aliasing for any queries that join to the same table (in this case, entities)
    # multiple times via joined table inheritance
    # ref: https://github.com/sqlalchemy/sqlalchemy/discussions/6972
    entity_alias = aliased(UploadedPathogenGenome, flat=True)
    # We've already validated that the user has access to a phylo tree at this point.
    phylo_tree_query = (
        sa.select(PhyloTree)  # type: ignore
        .join(PhyloRun, PhyloTree.producing_workflow.of_type(PhyloRun))  # type: ignore
        .outerjoin(entity_alias, PhyloRun.inputs.of_type(entity_alias))  # type: ignore
        .outerjoin(Sample)  # type: ignore
        .filter(PhyloTree.entity_id == phylo_tree_id)  # type: ignore
        .filter(PhyloTree.pathogen == pathogen)  # type: ignore
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
    prefix_regex = re.compile(f"^{pathogen_repo_config.prefix}/", re.IGNORECASE)
    selected_samples = selected_samples.union(
        set(prefix_regex.sub("", item) for item in phylo_run.gisaid_ids)
    )
    # AuthZ note: We're not adding an additional sample access or public/private
    # identifier check here since the process_phylo_tree method already does that
    # filtering, and this data is only used to match any identifiers that are
    # *already* on the tree.

    for uploaded_pathogen_genome in phylo_run.inputs:
        sample = uploaded_pathogen_genome.sample
        stripped_identifier = prefix_regex.sub("", sample.public_identifier)
        selected_samples.add(stripped_identifier)
        selected_samples.add(f"{pathogen_repo_config.prefix}/{stripped_identifier}")
        selected_samples.add(sample.private_identifier)
    return selected_samples


@router.get("/{item_id}/sample_ids")
async def get_tree_metadata(
    item_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    az: AuthZSession = Depends(get_authz_session),
    pathogen: Pathogen = Depends(get_pathogen),
    splitio: SplitClient = Depends(get_splitio),
):
    preferred_public_db = splitio.get_pathogen_treatment(
        "PATHOGEN_public_repository", pathogen
    )
    # get the pathogen_repo_config  for given public_repository and pathogen
    import pdb; pdb.set_trace()
    pathogen_repo_config = await get_pathogen_repo_config_for_pathogen(
        pathogen, preferred_public_db, db
    )
    if pathogen_repo_config is None:
        raise ex.ServerException(
            "no public repository found for given pathogen public repository"
        )
    phylo_tree_data = await process_phylo_tree(
        db,
        az,
        item_id,
        pathogen,
        pathogen_repo_config,
        request.query_params.get("id_style"),
    )
    accessions = extract_accessions([], phylo_tree_data["tree"])

    selected_samples = await _get_selected_samples(
        db, item_id, pathogen, pathogen_repo_config
    )
    filename: str = f"{item_id}_sample_ids.tsv"
    streamer = MetadataTSVStreamer(filename, accessions, selected_samples)
    return streamer.get_response()
