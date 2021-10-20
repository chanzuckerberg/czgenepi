from typing import List

from aspen.api.schemas.base import BaseResponse


class UserBase(BaseResponse):
    agreed_to_tos: bool = False


class User(UserBase):
    pass


class Users(BaseResponse):
    items: List[User]
