from datetime import datetime

from pydantic import BaseModel


class BaseRequest(BaseModel):
    pass


def convert_datetime_to_iso_8601_with_z_suffix(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


class BaseResponse(BaseModel):
    class Config:
        orm_mode = True
        json_encoders = {datetime: convert_datetime_to_iso_8601_with_z_suffix}
