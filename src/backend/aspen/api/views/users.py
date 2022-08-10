from fastapi import APIRouter, Depends
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

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
async def get_current_user(user=Depends(get_auth_user)) -> UserMeResponse:
    set_user_groups(user)
    return UserMeResponse.from_orm(user)


@router.put("/me", response_model=UserMeResponse)
async def update_user_info(
    user_update_request: UserUpdateRequest,
    db: AsyncSession = Depends(get_db),
    auth0_client: Auth0Client = Depends(get_auth0_apiclient),
    user=Depends(get_auth_user),
) -> UserMeResponse:
    auth0_update_items = {}
    auth0_attributes = ["name"]

    for attribute, value in user_update_request:
        if value is not None:
            setattr(user, attribute, value)
            if attribute in auth0_attributes:
                auth0_update_items[attribute] = value

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
    user_query = get_usergroup_query(user_creation_request.auth0_user_id)
    user_query_result = await db.execute(user_query)
    created_user = user_query_result.unique().scalars().one()
    set_user_groups(created_user)
    return UserMeResponse.from_orm(created_user)
