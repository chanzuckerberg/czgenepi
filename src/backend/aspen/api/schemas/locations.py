from typing import List, Optional

from aspen.api.schemas.base import BaseResponse


class LocationResponse(BaseResponse):
    id: int
    region: Optional[str]
    country: Optional[str]
    division: Optional[str]
    location: Optional[str]


class LocationListResponse(BaseResponse):
    locations: List[LocationResponse]
