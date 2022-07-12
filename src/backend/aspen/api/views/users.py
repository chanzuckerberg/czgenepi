from fastapi import APIRouter, Depends
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request
from aspen.auth.role_manager import RoleManager
import sqlalchemy as sa

from aspen.api.authn import (
    get_admin_user,
    get_auth0_apiclient,
    get_auth_user,
    get_usergroup_query,
)
from aspen.api.deps import get_db
from aspen.api.error import http_exceptions as ex
from aspen.api.schemas.usergroup import (
    UserMeResponse,
    UserPostRequest,
    UserUpdateRequest,
)
from aspen.auth.auth0_management import Auth0Client
from aspen.database.models import User

router = APIRouter()


def set_user_groups(user):
    groups = {}
    for row in user.user_roles:
        if groups.get(row.group.id):
            groups[row.group.id]["roles"].append(row.role.name)
        else:
            groups[row.group.id] = {
                "id": row.group.id,
                "name": row.group.name,
                "roles": [row.role.name],
            }
    user.groups = list(groups.values())


@router.get("/me", response_model=UserMeResponse)
async def get_current_user(
    request: Request, db: AsyncSession = Depends(get_db), user=Depends(get_auth_user),
    auth0_mgmt: Auth0Client = Depends(get_auth0_apiclient),
) -> UserMeResponse:
    user = (await(db.execute(sa.select(User).where(User.id == 1)))).scalars().one()
    await RoleManager.sync_user_roles(db, auth0_mgmt, user)
    await db.commit()
    return UserMeResponse.from_orm(user)


@router.put("/me", response_model=UserMeResponse)
async def update_user_info(
    user_update_request: UserUpdateRequest,
    db: AsyncSession = Depends(get_db),
    auth0_client: Auth0Client = Depends(get_auth0_apiclient),
    user=Depends(get_auth_user),
) -> UserMeResponse:
    auth0_update_items = {}

    if user_update_request.agreed_to_tos is not None:
        user.agreed_to_tos = user_update_request.agreed_to_tos
    if user_update_request.acknowledged_policy_version is not None:
        user.acknowledged_policy_version = (
            user_update_request.acknowledged_policy_version
        )
    if user_update_request.name is not None:
        user.name = user_update_request.name
        auth0_update_items["name"] = user_update_request.name
    await db.commit()

    if user.auth0_user_id and len(auth0_update_items) > 0:
        auth0_client.update_user(user.auth0_user_id, **auth0_update_items)
    set_user_groups(user)
    return UserMeResponse.from_orm(user)


# Requires prior auth0 account for the new user.
@router.post("/", response_model=UserMeResponse)
async def post_usergroup(
    user_creation_request: UserPostRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_admin_user),
) -> UserMeResponse:
    new_user = User(**dict(user_creation_request))
    db.add(new_user)
    try:
        await db.commit()
    except IntegrityError:
        raise ex.BadRequestException("User already exists")
    user_query = get_usergroup_query(db, user_creation_request.auth0_user_id)
    user_query_result = await db.execute(user_query)
    created_user = user_query_result.unique().scalars().one()
    set_user_groups(created_user)
    return UserMeResponse.from_orm(created_user)
