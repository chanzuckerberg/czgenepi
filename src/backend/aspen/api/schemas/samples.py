import datetime
from typing import Any, List, Optional

from pydantic import constr, Field
from pydantic.utils import GetterDict

from aspen.api.schemas.base import BaseRequest, BaseResponse
from aspen.api.utils import format_sample_lineage


class SampleRequestSchema(BaseRequest):
    # mypy + pydantic is a work in progress: https://github.com/samuelcolvin/pydantic/issues/156
    name: constr(min_length=1, max_length=128, strict=True)  # type: ignore


class SampleGisaidResponseSchema(BaseResponse):
    gisaid_id: Optional[str]
    status: str


class SampleLineageResponseSchema(BaseResponse):
    last_updated: Optional[datetime.datetime]
    lineage: Optional[str]
    probability: Optional[float]
    version: Optional[str]


class SampleGroupResponseSchema(BaseResponse):
    class Config:
        orm_mode = True

    id: int
    name: str


class SampleUserResponseSchema(BaseResponse):
    class Config:
        orm_mode = True

    id: int
    name: str


class SampleGetterDict(GetterDict):
    def get(self, key: Any, default: Any = None) -> Any:
        default_response = getattr(self._obj, key, default)
        indirect_attributes = {
            "sequencing_date": (
                self._obj.uploaded_pathogen_genome.sequencing_date
                if self._obj.uploaded_pathogen_genome
                else None
            ),
            "upload_date": (
                self._obj.uploaded_pathogen_genome.upload_date
                if self._obj.uploaded_pathogen_genome
                else None
            ),
            "lineage": format_sample_lineage(self._obj),
            "private_identifier": (
                self._obj.private_identifier
                if self._obj.show_private_identifier
                else None
            ),
        }
        if key in indirect_attributes:
            return indirect_attributes[key]
        return default_response


class SampleResponseSchema(BaseResponse):
    class Config:
        orm_mode = True
        getter_dict = SampleGetterDict
        allow_population_by_field_name = True

    id: int
    collection_date: datetime.date
    location: Optional[str] = Field(alias="collection_location")
    czb_failed_genome_recovery: bool
    gisaid: SampleGisaidResponseSchema
    lineage: SampleLineageResponseSchema
    private: bool
    private_identifier: Optional[str]
    public_identifier: str
    sequencing_date: Optional[datetime.date]
    submitting_group: SampleGroupResponseSchema
    uploaded_by: SampleUserResponseSchema
    upload_date: Optional[datetime.datetime]


class SampleBulkDeleteRequest(BaseRequest):
    ids: List[int]


class SamplesResponseSchema(BaseResponse):
    samples: List[SampleResponseSchema]


class SampleBulkDeleteResponse(BaseResponse):
    ids: List[int]


class SampleDeleteResponse(BaseResponse):
    id: int
