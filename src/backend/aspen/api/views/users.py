from fastapi import APIRouter, HTTPException
from starlette.requests import Request

from aspen.api.schemas.users import User as userschema
from aspen.api.schemas.users import Users as userlistschema
from aspen.database.models.usergroup import User

router = APIRouter()


@router.get("/me", response_model=userschema)
async def get_current_user(request: Request) -> userschema:
    instance = await User.get_by_id(request.state.auth_user.id)
    if not instance:
        raise HTTPException(status_code=404, detail="User is not found")
    return userschema.from_orm(instance)
