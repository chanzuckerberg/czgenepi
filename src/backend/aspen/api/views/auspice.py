import hashlib
import hmac
import json
import os
import re
from base64 import urlsafe_b64decode, urlsafe_b64encode
from datetime import datetime, timedelta, timezone
from typing import Iterable, List, MutableSequence, Set

import sentry_sdk
import sqlalchemy as sa
from boto3 import Session
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from sqlalchemy.orm.exc import NoResultFound
from starlette.requests import Request

from aspen.api.auth import get_auth_user
from aspen.api.deps import get_db, get_settings
from aspen.api.error import http_exceptions as ex
from aspen.api.schemas.auspice import GenerateAuspiceMagicLinkResponse
from aspen.api.settings import Settings
from aspen.api.utils import get_matching_gisaid_ids
from aspen.app.views.api_utils import (
    authz_sample_filters,
    get_missing_and_found_sample_ids,
)
from aspen.database.models import (
    AlignedGisaidDump,
    DataType,
    PathogenGenome,
    PhyloRun,
    PhyloTree,
    Sample,
    TreeType,
    User,
    Workflow,
    WorkflowStatusType,
)

router = APIRouter()

# def _process_phylo_tree(db: AsyncSession, user: User, phylo_tree_id: int) -> dict:
#     """Retrieves a phylo tree and renames the nodes on the tree for a given user."""
#     tree_query: Query = (
#         db_session.query(PhyloTree)
#         .join(PhyloRun)
#         .options(joinedload(PhyloTree.constituent_samples))
#     )
#     tree_query = authz_phylo_tree_filters(tree_query, {phylo_tree_id}, user)
#     phylo_tree: PhyloTree
#     try:
#         phylo_tree = tree_query.one()
#     except sqlalchemy.exc.NoResultFound:  # type: ignore
#         raise ex.BadRequestException(
#             f"PhyloTree with id {phylo_tree_id} not viewable by user with id: {user.id}"
#         )

#     sample_filter: Callable[[Sample], bool]
#     if user.system_admin:

#         def sample_filter(_: Sample):
#             return True

#     else:
#         can_see_group_ids_pi: Set[int] = {user.group_id}
#         can_see_group_ids_pi.update(
#             {
#                 can_see.owner_group_id
#                 for can_see in user.group.can_see
#                 if can_see.data_type == DataType.PRIVATE_IDENTIFIERS
#             }
#         )

#         def sample_filter(sample: Sample):
#             return sample.submitting_group_id in can_see_group_ids_pi

#     identifier_map: Mapping[str, str] = {
#         sample.public_identifier.replace("hCoV-19/", ""): sample.private_identifier
#         for sample in phylo_tree.constituent_samples
#         if sample_filter(sample)
#     }

#     s3 = boto3.resource(
#         "s3",
#         endpoint_url=os.getenv("BOTO_ENDPOINT_URL") or None,
#         config=boto3.session.Config(signature_version="s3v4"),
#     )

#     data = (
#         s3.Bucket(phylo_tree.s3_bucket).Object(phylo_tree.s3_key).get()["Body"].read()
#     )
#     json_data = json.loads(data)

#     rename_nodes_on_tree([json_data["tree"]], identifier_map, "GISAID_ID")

#     return json_data


async def _get_accessible_phylo_runs(db, user, run_id=None, editable=False):
    # get phylo_runs viewable or editable by a user, optionally filtered by id
    cansee_owner_group_ids: Set[int] = {
        cansee.owner_group_id
        for cansee in user.group.can_see
        if cansee.data_type == DataType.TREES
    }
    query = sa.select(PhyloRun).options(
        joinedload(PhyloRun.outputs.of_type(PhyloTree)),
        joinedload(PhyloRun.user),  # For Pydantic serialization
        joinedload(PhyloRun.group),  # For Pydantic serialization
    )

    # These are access control checks!
    if editable:
        # for update and delete views return only trees that are in the users group
        query = query.filter(
            PhyloRun.group == user.group,
        )
    else:
        # this is for list view, return all runs that are viewable
        query = query.filter(
            sa.or_(
                PhyloRun.group == user.group,
                user.system_admin,
                PhyloRun.group_id.in_(cansee_owner_group_ids),
            ),
        )

    if run_id:
        query = query.filter(PhyloRun.id == run_id)
        results = await db.execute(query)
        try:
            run = results.scalars().unique().one()
        except NoResultFound:
            raise ex.NotFoundException("phylo run not found")
        if run.workflow_status == WorkflowStatusType.STARTED:
            raise ex.BadRequestException("Can't modify an in-progress phylo run")
        return run

    results = await db.execute(query)
    return results.unique().scalars().all()


@router.get("/generate/{phylo_tree_id}")
def generate_auspice_string(
    phylo_tree_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
):
    phylo_run = _get_accessible_phylo_runs(db, user, run_id=phylo_tree_id)
    if not phylo_run:
        raise Ex.NotFoundException("No phylo run found for auspice request")

    expiry_time = datetime.now(timezone.utc) + timedelta(hours=1)
    payload = {"tree_id": phylo_tree_id, "expiry": expiry_time.isoformat()}

    # encode before hashing
    bytes_payload = json.dumps(payload).encode("utf8")
    message = urlsafe_b64encode(bytes_payload)
    # our mac key is stored as a b64encoded string
    mac_key = urlsafe_b64decode(settings.AUSPICE_MAC_KEY)
    digest_maker = hmac.new(mac_key, message, hashlib.sha3_512)
    mac_tag = digest_maker.hexdigest()

    return GenerateAuspiceMagicLinkResponse.parse_obj(
        {
            "url": f'{request.url.netloc}/v2/auspice/access/{message.decode("utf8")}.{mac_tag}'
        }
    )


@router.get("/access/{magic_string}")
def auspice_view(
    magic_string: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
):
    pass
