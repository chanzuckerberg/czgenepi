"""
Views for generating tree fetch magic links and accessing via those links.

To enable accessing a phylo tree outside of our app (eg, Auspice or Galago),
the user can generate a magic link that has auth embedded in the link. These
links have a fixed expiration time, but within the expiration window, anyone
with the link can pull the tree. This lets us generate a link, then send that
link to another service to view/interpret whatever tree the link points to.

NOTE
While this file, the routing, and the functions are all named around "auspice"
in various ways, that's a historical artifact. The first service we used this
for was Auspice (from Nextstrain), and it was named for that, but at this point
it's just generally for enabling external access to trees (like for Galago).
TODO (nice-to-have) [Vince]: Would be good to rename to a more general name
rather than "auspice" -- "treefetch" or "fetch/tree" "magicfetch" or ???
However the name shows up in a lot of places -- filenames, functions, tests,
routing, and a bit on FE as well -- so I'm taking the easy way out right now
and just leaving the name alone.
"""
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
from aspen.api.deps import get_db, get_pathogen, get_settings, get_splitio
from aspen.api.error import http_exceptions as ex
from aspen.api.schemas.auspice import (
    GenerateAuspiceMagicLinkRequest,
    GenerateAuspiceMagicLinkResponse,
)
from aspen.api.settings import APISettings
from aspen.api.utils import process_phylo_tree, verify_and_access_phylo_tree
from aspen.api.utils.pathogens import get_pathogen_repo_config_for_pathogen
from aspen.database.models import Group, Pathogen, User
from aspen.util.split import SplitClient

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
    splitio: SplitClient = Depends(get_splitio),
):
    # Load tree
    phylo_tree_id = payload["tree_id"]
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
    tree_json = await process_phylo_tree(
        db, az, phylo_tree_id, pathogen, pathogen_repo_config
    )

    # Return the tree
    return tree_json
