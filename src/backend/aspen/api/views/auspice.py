import hashlib
import hmac
import json
from base64 import urlsafe_b64decode, urlsafe_b64encode
from datetime import datetime, timedelta, timezone

import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from starlette.requests import Request

from aspen.api.authn import get_auth_user
from aspen.api.deps import get_db, get_settings
from aspen.api.error import http_exceptions as ex
from aspen.api.schemas.auspice import (
    GenerateAuspiceMagicLinkRequest,
    GenerateAuspiceMagicLinkResponse,
)
from aspen.api.settings import Settings
from aspen.api.utils import process_phylo_tree, verify_and_access_phylo_tree
from aspen.database.models import Group, User

router = APIRouter()


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
    (
        authorized_tree_access,
        _phylo_tree,
        _phylo_run,
    ) = await verify_and_access_phylo_tree(db, user, phylo_tree_id)
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
    except sa.exc.NoResultFound:  # type: ignore
        raise ex.BadRequestException("Nonexistent user in auspice magic link")

    # Load tree
    phylo_tree_id = recovered_payload["tree_id"]
    tree_json = await process_phylo_tree(db, user, phylo_tree_id)

    # Return the tree
    return tree_json
