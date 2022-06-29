from datetime import datetime, timezone

from pydantic import BaseModel


class BaseRequest(BaseModel):
    class Config:
        """Extra configuration options"""

        anystr_strip_whitespace = (
            True  # remove leading/trailing whitespace from strings
        )


def convert_datetime_to_iso_8601(dt: datetime) -> str:
    if not dt.tzinfo:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat(timespec="seconds")


class BaseResponse(BaseModel):
    class Config:
        orm_mode = True
        json_encoders = {datetime: convert_datetime_to_iso_8601}
