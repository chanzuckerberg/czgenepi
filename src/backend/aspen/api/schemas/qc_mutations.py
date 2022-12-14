from aspen.api.schemas.base import BaseRequest


class QcMutationsRequest(BaseRequest):
    # List of either Sample.public_identifier or Sample.private_identifier
    sample_ids: list[str]
