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
from aspen.api.utils import authz_phylo_tree_filters, get_matching_gisaid_ids
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


async def _verify_phylo_tree_access(
    db: AsyncSession, user: User, phylo_tree_id: int
) -> bool:
    tree_query = sa.select(PhyloTree).join(PhyloRun)
    authz_tree_query = authz_phylo_tree_filters(tree_query, user, set([phylo_tree_id]))
    authz_tree_query_result = await db.execute(authz_tree_query)
    phylo_tree: PhyloTree
    try:
        phylo_tree = authz_tree_query_result.one()
    except sa.exc.NoResultFound:  # type: ignore
        raise ex.BadRequestException(
            f"PhyloTree with id {phylo_tree_id} not viewable by user with id: {user.id}"
        )
    return True


async def _get_phylo_tree_json(db: AsyncSession, phylo_tree_id: int) -> str:
    pass


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


# TODO: Convert to POST request
@router.get("/generate/{phylo_tree_id}")
async def generate_auspice_string(
    phylo_tree_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
):
    phylo_run_db_response = await _verify_phylo_tree_access(db, user, phylo_tree_id)
    if not phylo_run_db_response:
        raise Ex.BadRequestException("No phylo run found for auspice request")

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


@router.get("/access/{magic_link}")
def auspice_view(
    magic_link: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
):
    # First, verify the MAC tag.
    payload_message, payload_mac_tag = magic_link.split(".")
    encoded_payload_message = payload_message.encode("utf8")

    mac_key = urlsafe_b64decode(settings.AUSPICE_MAC_KEY)
    digest_maker = hmac.new(mac_key, encoded_payload_message, hashlib.sha3_512)
    correct_mac_tag = digest_maker.hexdigest()

    authenticated = hmac.compare_digest(payload_mac_tag, correct_mac_tag)
    if not authenticated:
        raise Ex.BadRequestException(
            "Unauthenticated attempt to access an auspice magic link"
        )

    # Then decode the payload.
    decoded_payload_message = urlsafe_b64decode(encoded_payload_message).decode("utf8")
    recovered_payload = json.loads(decoded_payload_message)

    # Test the expiry
    expiry_time = datetime.fromisoformat(recovered_payload["expiry"])
    if expiry_time <= datetime.now(timezone.utc):
        raise Ex.BadRequestException("Expired auspice view magic link")

    # Return the tree
    return "AUTHENTIC MAGIC LINK!"
