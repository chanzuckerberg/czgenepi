from aspen.api.schemas.base import BaseResponse
from typing import List


class UserBase(BaseResponse):
    agreed_to_tos: bool = False


class User(UserBase):
    pass


class Users(BaseResponse):
    items: List[User]
