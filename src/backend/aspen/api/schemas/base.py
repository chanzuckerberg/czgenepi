from pydantic import BaseModel


class BaseRequest(BaseModel):
    pass

class BaseResponse(BaseModel):
    class Config:
        orm_mode = True
