from typing import List

from aspen.api.schemas.base import BaseResponse


class UserBase(BaseResponse):
    group_id: int
    agreed_to_tos: bool = False


class User(UserBase):
    pass


class Users(BaseResponse):
    items: List[User]
