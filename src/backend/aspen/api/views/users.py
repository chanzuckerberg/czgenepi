from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

from aspen.api.auth import get_auth_user
from aspen.api.deps import get_db
from aspen.api.schemas.users import UserMeResponse, UserUpdateRequest

router = APIRouter()


@router.get("/me", response_model=UserMeResponse)
async def get_current_user(
    request: Request, db: AsyncSession = Depends(get_db), user=Depends(get_auth_user)
) -> UserMeResponse:
    return UserMeResponse.from_orm(user)


@router.put("/me", response_model=UserMeResponse)
async def update_user_info(
    user_update_request: UserUpdateRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_auth_user),
) -> UserMeResponse:
    user.agreed_to_tos = user_update_request.agreed_to_tos
    user.acknowledged_policy_version = user_update_request.acknowledged_policy_version
    await db.commit()
    return UserMeResponse.from_orm(user)
