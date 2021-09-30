from fastapi import APIRouter, HTTPException

from aspen.api.schemas.users import User as userschema
from aspen.api.schemas.users import Users as userlistschema
from aspen.database.models.usergroup import User

router = APIRouter()


@router.get("/", response_model=userlistschema)
async def list_users() -> userlistschema:
    objects = await User.all()
    return userlistschema.parse_obj({"items": objects})


@router.get("/{user_id}/", response_model=userschema)
async def get_user(user_id: int) -> userschema:
    instance = await User.get_by_id(user_id)
    if not instance:
        raise HTTPException(status_code=404, detail="User is not found")
    return userschema.from_orm(instance)
