from typing import List, Optional

from pydantic import constr

from aspen.api.schemas.base import BaseRequest, BaseResponse


class SampleRequestSchema(BaseRequest):
    # mypy + pydantic is a work in progress: https://github.com/samuelcolvin/pydantic/issues/156
    name: constr(min_length=1, max_length=128, strict=True)  # type: ignore


class SampleGisaidResponseSchema(BaseResponse):
    gisaid_id: Optional[str]
    status: str


class SampleLineageResponseSchema(BaseResponse):
    last_updated: Optional[str]
    lineage: Optional[str]
    probability: Optional[str]
    version: Optional[str]


class SampleGroupResponseSchema(BaseResponse):
    id: int
    name: str


class SampleUserResponseSchema(BaseResponse):
    id: int
    name: str


class SampleResponseSchema(BaseResponse):
    collection_date: str
    collection_location: str
    czb_failed_genome_recovery: bool
    gisaid: SampleGisaidResponseSchema
    lineage: SampleLineageResponseSchema
    private: bool
    private_identifier: str
    public_identifier: str
    sequencing_date: Optional[str]
    submitting_group: SampleGroupResponseSchema
    uploaded_by: SampleUserResponseSchema
    upload_date: Optional[str]


class SamplesResponseSchema(BaseResponse):
    samples: List[SampleResponseSchema]


class SampleDeleteResponse(BaseResponse):
    id: int
