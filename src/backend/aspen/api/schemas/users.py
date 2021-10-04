from typing import List

from pydantic import BaseModel


class Base(BaseModel):
    class Config:
        orm_mode = True


class UserBase(Base):
    agreed_to_tos: bool = False


class User(UserBase):
    pass


class Users(Base):
    items: List[User]
