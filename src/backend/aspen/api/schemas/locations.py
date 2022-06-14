from typing import List, Optional

from aspen.api.schemas.base import BaseResponse, BaseRequest


class LocationResponse(BaseResponse):
    id: int
    region: str
    country: str
    division: Optional[str]
    location: Optional[str]


class LocationListResponse(BaseResponse):
    locations: List[LocationResponse]


class LocationSearchRequest(BaseRequest):
    region: Optional[str]
    country: Optional[str]
    division: Optional[str]
    location: Optional[str]