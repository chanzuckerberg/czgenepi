import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

from aspen.api.auth import get_auth_user
from aspen.api.deps import get_db
from aspen.api.schemas.usergroup import AllGroupsMembersResponse
from aspen.database.models import User

router = APIRouter()


@router.get("/members", response_model=AllGroupsMembersResponse)
async def get_group_members(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_auth_user),
) -> AllGroupsMembersResponse:
    # For now a user only has one group
    usergroups = [user.group]
    group_member_data = []
    for group in usergroups:
        group_members_query = (
            sa.select(User).where(User.group == group).order_by(User.name.asc())  # type: ignore
        )
        group_members_result = await db.execute(group_members_query)
        group_members = group_members_result.scalars().all()
        group_member_data.append({"group": group, "members": group_members})
    return AllGroupsMembersResponse.parse_obj({"groups": group_member_data})
