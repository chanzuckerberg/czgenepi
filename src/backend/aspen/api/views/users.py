from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

from aspen.api.auth import get_auth_user
from aspen.api.deps import get_db
from aspen.api.schemas.users import UserResponse

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    request: Request, db: AsyncSession = Depends(get_db), user=Depends(get_auth_user)
) -> UserResponse:
    return UserResponse.from_orm(user)
