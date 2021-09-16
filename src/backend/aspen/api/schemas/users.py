from typing import List, Optional

from pydantic import BaseModel, PositiveInt


class Base(BaseModel):
    class Config:
        orm_mode = True


class UserBase(Base):
    agreed_to_tos: bool = None


class User(UserBase):
    pass


class Users(Base):
    items: List[User]
