from fastapi import APIRouter, HTTPException
from starlette.requests import Request
from aspen.api.deps import get_db
from fastapi import Depends

from aspen.api.schemas.users import User as userschema
from aspen.database.models.usergroup import User

router = APIRouter()


@router.get("/me", response_model=userschema)
async def get_current_user(request: Request, db=Depends(get_db)) -> userschema:
    instance = await User.get_by_id(db, request.state.auth_user.id)
    if not instance:
        raise HTTPException(status_code=404, detail="User is not found")
    return userschema.from_orm(instance)
