import re
import io
from typing import Dict, Mapping, Optional, Set, Tuple
import zipfile
from zipfile import ZipFile

import sentry_sdk
import sqlalchemy as sa
from auth0.v3.exceptions import Auth0Error
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import contains_eager, joinedload
from sqlalchemy.sql.expression import Select
from sqlalchemy import select
from starlette.requests import Request

from aspen.api.authn import get_admin_user, get_auth0_apiclient, get_auth_user
from aspen.api.authz import fetch_authorized_row, require_access, AuthZSession, get_authz_session
from aspen.api.deps import get_db, get_settings
from aspen.api.error import http_exceptions as ex
from aspen.api.schemas.usergroup import (
    GroupCreationRequest,
    GroupInfoResponse,
    GroupInvitationsRequest,
    GroupInvitationsResponse,
    GroupMembersResponse,
    InvitationsResponse,
)
from aspen.database.models.pathogens import PathogenRepoConfig
from aspen.api.schemas.sunset import TreeDownloadRequest
from aspen.api.settings import APISettings
from aspen.api.utils import _set_colors, _rename_nodes_on_tree
from aspen.auth.auth0_management import Auth0Client, Auth0Org
from aspen.database.models import Group, User, UserRole
from aspen.database.models import (
    Pathogen,
    PhyloRun,
    PhyloTree,
    Sample,
    UploadedPathogenGenome,
)

import json
import os
import re
from collections import namedtuple
from typing import Dict, Mapping, Optional, Set, Tuple

import boto3
import sqlalchemy as sa
from sqlalchemy import asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, joinedload, selectinload
from sqlalchemy.sql.expression import and_, or_

from aspen.api.authz import AuthZSession
from aspen.api.error import http_exceptions as ex
from aspen.database.models import Group, Location, Pathogen, PhyloRun, PhyloTree, Sample
from aspen.database.models.pathogens import PathogenRepoConfig

router = APIRouter()


import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


@router.post("/create_tree_download")
async def create_tree_download(
    tree_download_request: TreeDownloadRequest,
    db: AsyncSession = Depends(get_db),
    az: AuthZSession = Depends(get_authz_session),
    user: User = Depends(get_admin_user),
) -> None:
    group_id = tree_download_request.group_id
    logger.debug(f"group_id: {group_id}")
    phylo_trees = await get_all_phylo_trees(db, az, group_id)
    logger.debug(f"phylo_tree_ids: {[tree.entity_id for tree in phylo_trees]}")
    tree_data = [{"model": tree, "json": await process_phylo_tree(db, tree.entity_id)} for tree in phylo_trees]
    # return JSONResponse(content=[tree["model"].entity_id for tree in tree_data])
    zip_bytes = io.BytesIO()
    archive = ZipFile(zip_bytes, mode="x", compression=zipfile.ZIP_DEFLATED)
    for tree in tree_data:
        model = tree["model"]
        tree_json = tree["json"]
        archive.writestr(f"trees/{model.pathogen.name}/{model.name}_{model.entity_id}/tree.json", json.dumps(tree_json))
        archive.writestr(f"trees/{model.pathogen.name}/{model.name}_{model.entity_id}/samples.txt", "\n".join([sample.private_identifier for sample in model.constituent_samples]))
    archive.close()
    s3 = boto3.resource(
        "s3",
        endpoint_url=os.getenv("BOTO_ENDPOINT_URL") or None,
        config=boto3.session.Config(signature_version="s3v4"),
    )
    s3_obj = s3.Object(bucket_name="genepi-sunset", key=f"{group_id}/trees.zip")
    s3_obj.put(Body=zip_bytes.getvalue())
    presigned_url = s3.meta.client.generate_presigned_url("get_object", Params={"Bucket": s3_obj.bucket_name, "Key": s3_obj.key}, ExpiresIn=172800)
    return JSONResponse(content={"url": presigned_url})

    


async def get_all_phylo_trees(
    db: AsyncSession,
    az: AuthZSession,
    group_id: int,
) -> list[int]:
    # tree_query = (await az.authorized_query("read", PhyloTree))  # type: ignore
    tree_query = select(PhyloTree)
    tree_query = tree_query.options(selectinload(PhyloTree.constituent_samples), joinedload(PhyloTree.pathogen))
    tree_query = tree_query.filter(PhyloTree.group_id.in_({group_id}))  # type: ignore
    logger.debug("Tree query:")
    logger.debug(tree_query)
    tree_query_result = await db.execute(tree_query)
    phylo_trees: Optional[PhyloTree] = (
        tree_query_result.scalars().all()
    )
    return phylo_trees


async def access_phylo_tree(
    db: AsyncSession,
    phylo_tree_id: int,
    load_samples: bool = True,
) -> Tuple[bool, Optional[PhyloTree], Optional[PhyloRun]]:
    tree_query = select(PhyloTree)  # type: ignore
    if load_samples:
        tree_query = tree_query.options(selectinload(PhyloTree.constituent_samples), joinedload(PhyloTree.pathogen))  # type: ignore
    tree_query = tree_query.filter(PhyloTree.entity_id.in_({phylo_tree_id}))  # type: ignore
    tree_query_result = await db.execute(tree_query)
    phylo_tree: Optional[PhyloTree] = (
        tree_query_result.scalars().unique().one_or_none()
    )
    if not phylo_tree:
        # Either the tree doesn't exist or we don't have access to it.
        return None, None
    run_query = (
        select(PhyloRun)
        .filter(PhyloRun.id == phylo_tree.producing_workflow_id)
        .options(
            selectinload(PhyloRun.group).joinedload(Group.default_tree_location),
        )
    )  # type: ignore
    run_query_result = await db.execute(run_query)
    phylo_run: Optional[PhyloRun]
    phylo_run = run_query_result.scalars().unique().one()
    return phylo_tree, phylo_run


async def process_phylo_tree(
    db: AsyncSession,
    phylo_tree_id: int,
    id_style: Optional[str] = None,
) -> dict:
    (
        phylo_tree_result,
        phylo_run_result,
    ) = await access_phylo_tree(
        db, phylo_tree_id, load_samples=True
    )
    if not phylo_tree_result:
        raise ex.BadRequestException(
            f"PhyloTree with id {phylo_tree_id} not found"
        )
    if not phylo_run_result:
        raise ex.ServerException(f"No phylo run found for phylo tree {phylo_tree_id}")
    phylo_tree: PhyloTree = phylo_tree_result
    phylo_run: PhyloRun = phylo_run_result

    s3 = boto3.resource(
        "s3",
        endpoint_url=os.getenv("BOTO_ENDPOINT_URL") or None,
        config=boto3.session.Config(signature_version="s3v4"),
    )

    data = (
        s3.Bucket(phylo_tree.s3_bucket).Object(phylo_tree.s3_key).get()["Body"].read()
    )
    json_data = json.loads(data)
    name = "TEST"
    # name = pathogen_repo_config.public_repository.name
    save_key = "{}_ID".format(name.upper())
    if id_style == "public":
        json_data = await _set_colors(db, json_data, phylo_run)
        json_data["tree"] = _rename_nodes_on_tree(
            "test", json_data["tree"], {}, save_key  # not pathogen_repo_config.prefix
        )
        return json_data

    # Load all the public:private sample mappings this user/group has access to.
    # TODO we should limit the query scope here to just the samples on the tree.
    identifier_map: Dict[str, str] = {}
    translatable_samples: list[Sample] = (
        (
            await db.execute(
                select(Sample)  # type: ignore
            )
        )
        .scalars()
        .all()
    )
    for sample in translatable_samples:
        public_id = sample.public_identifier.replace(
            f"test/", ""  # not pathogen_repo_config.prefix
        )
        identifier_map[public_id] = sample.private_identifier
    # we pass in the root node of the tree to the recursive naming function.
    json_data["tree"] = _rename_nodes_on_tree(
        "test", json_data["tree"], identifier_map, save_key  # not pathogen_repo_config.prefix
    )
    # set country labeling/colors
    json_data = await _set_colors(db, json_data, phylo_run)
    return json_data

