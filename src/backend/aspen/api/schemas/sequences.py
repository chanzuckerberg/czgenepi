from aspen.api.schemas.base import BaseRequest


class SequenceRequest(BaseRequest):
    sample_ids: list[str]
