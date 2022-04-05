from aspen.api.schemas.base import BaseRequest


class SequenceRequest(BaseRequest):
    sample_ids: list[str]

class FastaURLRequest(BaseRequest):
    samples: list[str]
    downstream_consumer: str

class FastaURLResponse(BaseResponse):
    url: str