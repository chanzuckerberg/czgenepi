from fastapi import APIRouter, Depends
import sqlalchemy as sa
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

from aspen.api.auth import get_admin_user, get_auth_user, get_usergroup_query
from aspen.api.deps import get_db
from aspen.api.schemas.usergroup import AllGroupsMembersResponse
from aspen.database.models import User, Group
from aspen.error import http_exceptions as ex


router = APIRouter()


@router.get("/members", response_model=AllGroupsMembersResponse)
async def get_group_members(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_auth_user),
) -> AllGroupsMembersResponse:
    # For now a user only has one group
    usergroups = [user.group]
    # For now a user can only be an administrator of one group
    if not user.group_admin:
        raise ex.UnauthorizedException("Not authorized")
    group_member_data = []
    for group in usergroups:
        group_members_query = sa.select(User).where(User.group == group).order_by(User.name.asc())
        group_members_result = await db.execute(group_members_query)
        group_members = group_members_result.scalars().all()
        group_member_data.append({ "group": group, "members": group_members })
    return AllGroupsMembersResponse.parse_obj({ "groups": group_member_data })