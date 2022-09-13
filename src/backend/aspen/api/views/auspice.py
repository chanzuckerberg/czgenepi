import hashlib
import hmac
import json
from base64 import urlsafe_b64decode, urlsafe_b64encode
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

from aspen.api.authn import (
    AuthContext,
    get_auth_context,
    get_auth_user,
    magic_link_payload,
    MagicLinkPayload,
    require_group_membership,
)
from aspen.api.authz import AuthZSession, get_authz_session
from aspen.api.deps import get_db, get_pathogen, get_settings
from aspen.api.error import http_exceptions as ex
from aspen.api.schemas.auspice import (
    GenerateAuspiceMagicLinkRequest,
    GenerateAuspiceMagicLinkResponse,
)
from aspen.api.settings import APISettings
from aspen.api.utils import process_phylo_tree, verify_and_access_phylo_tree
from aspen.database.models import Group, Pathogen, User

router = APIRouter()


class AuspicePayload(MagicLinkPayload):
    tree_id: int


@router.post("/generate")
async def generate_auspice_string(
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: APISettings = Depends(get_settings),
    az: AuthZSession = Depends(get_authz_session),
    user: User = Depends(get_auth_user),
    ac: AuthContext = Depends(get_auth_context),
    group: Group = Depends(require_group_membership),
    pathogen: Pathogen = Depends(get_pathogen),
):
    request_body = await request.json()
    validated_body = GenerateAuspiceMagicLinkRequest.parse_obj(request_body)
    phylo_tree_id = validated_body.tree_id
    (
        authorized_tree_access,
        phylo_tree,
        _phylo_run,
    ) = await verify_and_access_phylo_tree(db, az, phylo_tree_id, pathogen)
    if not authorized_tree_access:
        raise ex.BadRequestException(
            "No phylo run found for user to generate auspice request"
        )

    expiry_time = datetime.now(timezone.utc) + timedelta(hours=48)
    payload: AuspicePayload = {
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
        url=f'{request.url.netloc}/v2/orgs/{ac.group.id}/pathogens/{phylo_tree.pathogen.slug}/auspice/access/{message.decode("utf8")}.{mac_tag}'  # type: ignore
    )


@router.get("/access/{magic_link}")
async def auspice_view(
    magic_link: str,
    payload: AuspicePayload = Depends(magic_link_payload),
    az: AuthZSession = Depends(get_authz_session),
    db: AsyncSession = Depends(get_db),
    pathogen: Pathogen = Depends(get_pathogen),
):
    # Load tree
    phylo_tree_id = payload["tree_id"]
    tree_json = await process_phylo_tree(db, az, phylo_tree_id, pathogen)

    # Return the tree
    return tree_json
