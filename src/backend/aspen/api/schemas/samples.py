from typing import Dict, List, Optional

from pydantic import constr

from aspen.api.schemas.base import BaseRequest, BaseResponse


class SampleGisaidResponseSchema(BaseResponse):
    gisaid_id: Optional[str]
    status: str


class SampleLineageResponseSchema(BaseResponse):
    last_updated: str = "N/A"
    lineage: Optional[str]
    probability: Optional[str]
    version: Optional[str]


class SampleRequestSchema(BaseRequest):
    # mypy + pydantic is a work in progress: https://github.com/samuelcolvin/pydantic/issues/156
    name: constr(min_length=1, max_length=128, strict=True)  # type: ignore


class SampleResponseSchema(BaseResponse):
    collection_date: str
    collection_location: str
    czb_failed_genome_recovery: bool
    # gisaid: SampleGisaidResponseSchema
    lineage: SampleLineageResponseSchema
    private: bool
    private_identifier: str
    public_identifier: str
    sequencing_date: str = "N/A"
    upload_date: str


class SamplesResponseSchema(BaseResponse):
    samples: List[SampleResponseSchema]
