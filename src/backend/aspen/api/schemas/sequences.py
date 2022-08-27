from typing import Optional

from aspen.api.schemas.base import BaseRequest, BaseResponse


class SequenceRequest(BaseRequest):
    public_repository_name: Optional[str] = None
    sample_ids: list[str]


class FastaURLRequest(BaseRequest):
    samples: list[str]
    downstream_consumer: Optional[str] = None


class FastaURLResponse(BaseResponse):
    url: str
