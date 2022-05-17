import datetime
from typing import List, Optional

from aspen.api.schemas.base import BaseRequest, BaseResponse
from aspen.api.schemas.users import UserResponse


class GroupMembersResponse(BaseResponse):
    members: List[UserResponse]