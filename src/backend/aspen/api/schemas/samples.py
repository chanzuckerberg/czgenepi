import datetime
from typing import Any, List, Optional

from pydantic import constr, validator
from pydantic.utils import GetterDict

from aspen.api.schemas.base import BaseRequest, BaseResponse
from aspen.api.schemas.locations import LocationResponse
from aspen.api.utils import format_sample_lineage

SEQUENCE_VALIDATION_REGEX = r"^[WSKMYRVHDBNZNATCGUwskmyrvhdbnznatcgu-]+$"


class SampleRequest(BaseRequest):
    # mypy + pydantic is a work in progress: https://github.com/samuelcolvin/pydantic/issues/156
    name: constr(min_length=1, max_length=128, strict=True)  # type: ignore


class SampleGisaidResponse(BaseResponse):
    gisaid_id: Optional[str]
    status: str


class SampleLineageResponse(BaseResponse):
    last_updated: Optional[datetime.datetime]
    lineage: Optional[str]
    confidence: Optional[float]
    version: Optional[str]
    scorpio_call: Optional[str]
    scorpio_support: Optional[float]
    qc_status: Optional[str]


class SampleGroupResponse(BaseResponse):
    class Config:
        orm_mode = True

    id: int
    name: str


class SampleUserResponse(BaseResponse):
    class Config:
        orm_mode = True

    id: int
    name: str


class SampleGetterDict(GetterDict):
    indirect_attributes = {
        "sequencing_date": lambda obj: (
            obj.uploaded_pathogen_genome.sequencing_date
            if obj.uploaded_pathogen_genome
            else None
        ),
        "upload_date": lambda obj: (
            obj.uploaded_pathogen_genome.upload_date
            if obj.uploaded_pathogen_genome
            else None
        ),
        "lineage": format_sample_lineage,
        "private_identifier": lambda obj: (
            obj.private_identifier if obj.show_private_identifier else None
        ),
    }

    def get(self, key: Any, default: Any = None) -> Any:
        if key in self.indirect_attributes:
            return self.indirect_attributes[key](self._obj)
        default_response = getattr(self._obj, key, default)
        return default_response


class SampleResponse(BaseResponse):
    class Config:
        orm_mode = True
        getter_dict = SampleGetterDict
        allow_population_by_field_name = True

    id: int
    collection_date: datetime.date
    collection_location: LocationResponse
    czb_failed_genome_recovery: bool
    gisaid: Optional[SampleGisaidResponse]
    lineage: Optional[SampleLineageResponse]
    private: bool
    private_identifier: Optional[str]
    public_identifier: Optional[str]
    sequencing_date: Optional[datetime.date]
    submitting_group: SampleGroupResponse
    uploaded_by: SampleUserResponse
    upload_date: Optional[datetime.datetime]


class SampleBulkDeleteRequest(BaseRequest):
    ids: List[int]


class SamplesResponse(BaseResponse):
    samples: List[SampleResponse]


class SampleBulkDeleteResponse(BaseResponse):
    ids: List[int]


class SampleDeleteResponse(BaseResponse):
    id: int


class UpdateSamplesBaseRequest(BaseRequest):
    id: int
    collection_date: Optional[datetime.date]
    collection_location: int
    private: bool
    private_identifier: constr(min_length=1, max_length=128, strict=True)  # type: ignore
    public_identifier: Optional[constr(min_length=1, max_length=128, strict=True)]  # type: ignore
    sequencing_date: Optional[datetime.date]


class UpdateSamplesRequest(BaseRequest):
    samples: List[UpdateSamplesBaseRequest]


class ValidateIDsRequest(BaseRequest):
    sample_ids: List[str]


class ValidateIDsResponse(BaseResponse):
    missing_sample_ids: List[str]


class CreateSamplePathogenGenomeRequest(BaseRequest):
    # For legacy reasons, we need to support empty strings as if they were None/Empty
    # https://github.com/samuelcolvin/pydantic/discussions/2687
    @validator("sequencing_date", pre=True)
    def empty_str_to_none(cls, v):
        if v == "":
            return None
        return v

    # following fields from PathogenGenome
    sequencing_date: Optional[datetime.date]
    sequencing_depth: Optional[float]
    sequence: constr(  # type: ignore
        min_length=1000,
        strict=True,
        regex=SEQUENCE_VALIDATION_REGEX,
    )  # type: ignore


class CreateSamplesBaseRequest(BaseRequest):
    private: bool
    private_identifier: str
    collection_date: datetime.date
    location_id: int
    organism: str = "Severe acute respiratory syndrome coronavirus 2"
    public_identifier: Optional[str]
    sample_collected_by: Optional[str]
    sample_collector_contact_email: Optional[str]
    sample_collector_contact_address: Optional[str]
    authors: Optional[str]
    host: Optional[str]
    purpose_of_sampling: Optional[str]
    specimen_processing: Optional[str]
    czb_failed_genome_recovery: Optional[bool]


class CreateSampleRequest(BaseRequest):
    sample: CreateSamplesBaseRequest
    pathogen_genome: CreateSamplePathogenGenomeRequest


class CreateSamplesResponse(BaseResponse):
    success: bool


class SubmissionTemplateRequest(BaseRequest):
    sample_ids: List[str]
    public_repository_name: str
    page: Optional[int]
