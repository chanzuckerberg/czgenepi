import hashlib
import hmac
import json
import os
from base64 import urlsafe_b64decode, urlsafe_b64encode
from datetime import datetime, timedelta, timezone
from typing import Mapping, Optional, Set, Tuple

import boto3
import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlalchemy.exc import NoResultFound  # type: ignore
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from starlette.requests import Request

from aspen.api.auth import get_auth_user
from aspen.api.deps import get_db, get_settings
from aspen.api.error import http_exceptions as ex
from aspen.api.schemas.auspice import (
    GenerateAuspiceMagicLinkRequest,
    GenerateAuspiceMagicLinkResponse,
)
from aspen.api.settings import Settings
from aspen.api.utils import authz_phylo_tree_filters
from aspen.database.models import DataType, Group, PhyloRun, PhyloTree, Sample, User

router = APIRouter()


def _rename_nodes_on_tree(
    node: dict,
    name_map: Mapping[str, str],
    save_key: Optional[str] = None,
) -> dict:
    """Given a tree, a mapping of identifiers to their replacements, rename the nodes on
    the tree.  If `save_key` is provided, then the original identifier is saved using
    that as the key."""
    name = node["name"]
    renamed_value = name_map.get(name, None)
    if renamed_value is not None:
        # we found the replacement value! first, save the old value if the caller
        # requested.
        if save_key is not None:
            node[save_key] = name
        node["name"] = renamed_value
    for child in node.get("children", []):
        _rename_nodes_on_tree(child, name_map, save_key)
    return node


async def _verify_phylo_tree_access(
    db: AsyncSession, user: User, phylo_tree_id: int, load_samples: bool = False
) -> Tuple[bool, Optional[PhyloTree]]:
    tree_query = sa.select(PhyloTree).join(PhyloRun)  # type: ignore
    if load_samples:
        tree_query = tree_query.options(selectinload(PhyloTree.constituent_samples))  # type: ignore
    authz_tree_query = authz_phylo_tree_filters(tree_query, user, set([phylo_tree_id]))  # type: ignore
    authz_tree_query_result = await db.execute(authz_tree_query)
    phylo_tree: PhyloTree
    try:
        phylo_tree = authz_tree_query_result.scalars().unique().one()
    except sa.exc.NoResultFound:  # type: ignore
        return False, None
    return True, phylo_tree


def _sample_filter(sample: Sample, can_see_pi_group_ids: Set[int], system_admin: bool):
    if system_admin:
        return True
    return sample.submitting_group_id in can_see_pi_group_ids


async def _get_and_filter_phylo_tree(
    db: AsyncSession, user: User, phylo_tree_id: int
) -> dict:
    authorized, phylo_tree_result = await _verify_phylo_tree_access(
        db, user, phylo_tree_id, load_samples=True
    )
    if not authorized or not phylo_tree_result:
        raise ex.BadRequestException("No phylo run found for auspice request")
    phylo_tree: PhyloTree = phylo_tree_result

    can_see_pi_group_ids: Set[int] = {user.group_id}
    can_see_pi_group_ids.update(
        {
            can_see.owner_group_id
            for can_see in user.group.can_see
            if can_see.data_type == DataType.PRIVATE_IDENTIFIERS
        }
    )

    identifier_map: Mapping[str, str] = {
        sample.public_identifier.replace("hCoV-19/", ""): sample.private_identifier
        for sample in phylo_tree.constituent_samples
        if _sample_filter(sample, can_see_pi_group_ids, user.system_admin)
    }

    s3 = boto3.resource(
        "s3",
        endpoint_url=os.getenv("BOTO_ENDPOINT_URL") or None,
        config=boto3.session.Config(signature_version="s3v4"),
    )

    data = (
        s3.Bucket(phylo_tree.s3_bucket).Object(phylo_tree.s3_key).get()["Body"].read()
    )
    json_data = json.loads(data)

    # we pass in the root node of the tree to the recursive naming function.
    json_data["tree"] = _rename_nodes_on_tree(
        json_data["tree"], identifier_map, "GISAID_ID"
    )

    return json_data


@router.post("/generate")
async def generate_auspice_string(
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
):
    request_body = await request.json()
    validated_body = GenerateAuspiceMagicLinkRequest.parse_obj(request_body)
    phylo_tree_id = validated_body.tree_id
    authorized_tree_access, _phylo_tree = await _verify_phylo_tree_access(
        db, user, phylo_tree_id
    )
    if not authorized_tree_access:
        raise ex.BadRequestException(
            "No phylo run found for user to generate auspice request"
        )

    expiry_time = datetime.now(timezone.utc) + timedelta(hours=1)
    payload = {
        "tree_id": phylo_tree_id,
        "user_id": user.id,
        "expiry": expiry_time.isoformat(),
    }

    # encode before hashing
    bytes_payload = json.dumps(payload).encode("utf8")
    message = urlsafe_b64encode(bytes_payload)
    # our mac key is stored as a b64encoded string
    mac_key = urlsafe_b64decode(settings.AUSPICE_MAC_KEY)
    digest_maker = hmac.new(mac_key, message, hashlib.sha3_512)
    mac_tag = digest_maker.hexdigest()

    return GenerateAuspiceMagicLinkResponse(
        url=f'{request.url.netloc}/v2/auspice/access/{message.decode("utf8")}.{mac_tag}'
    )


@router.get("/access/{magic_link}")
async def auspice_view(
    magic_link: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    # First, verify the MAC tag.
    payload_message, payload_mac_tag = magic_link.split(".")
    encoded_payload_message = payload_message.encode("utf8")

    mac_key = urlsafe_b64decode(settings.AUSPICE_MAC_KEY)
    digest_maker = hmac.new(mac_key, encoded_payload_message, hashlib.sha3_512)
    correct_mac_tag = digest_maker.hexdigest()

    authenticated = hmac.compare_digest(payload_mac_tag, correct_mac_tag)
    if not authenticated:
        raise ex.BadRequestException(
            "Unauthenticated attempt to access an auspice magic link"
        )

    # Then decode the payload.
    decoded_payload_message = urlsafe_b64decode(encoded_payload_message).decode("utf8")
    recovered_payload = json.loads(decoded_payload_message)

    # Test the expiry
    expiry_time = datetime.fromisoformat(recovered_payload["expiry"])
    if expiry_time <= datetime.now(timezone.utc):
        raise ex.BadRequestException("Expired auspice view magic link")

    # Recover user
    user_id = recovered_payload["user_id"]
    user_query = (
        sa.select(User)  # type: ignore
        .where(User.id == user_id)
        .options(selectinload(User.group).selectinload(Group.can_see))
    )
    result = await db.execute(user_query)
    try:
        user: User = result.scalars().one()
    except NoResultFound:
        raise ex.BadRequestException("Nonexistent user in auspice magic link")

    # Load tree
    phylo_tree_id = recovered_payload["tree_id"]
    tree_json = await _get_and_filter_phylo_tree(db, user, phylo_tree_id)

    # Return the tree
    return tree_json
