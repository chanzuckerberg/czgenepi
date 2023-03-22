import datetime
from typing import Dict, List, Optional

from pydantic import constr, Field, root_validator, StrictStr, validator

from aspen.api.schemas.base import BaseRequest, BaseResponse
from aspen.api.schemas.pathogens import PathogenResponse
from aspen.database.models import TreeType

# What kinds of ondemand nextstrain builds do we support?
PHYLO_TREE_TYPES = [
    TreeType.OVERVIEW.value,
    TreeType.NON_CONTEXTUALIZED.value,
    TreeType.TARGETED.value,
]


class TemplateArgsRequest(BaseRequest):
    filter_start_date: Optional[datetime.date]
    filter_end_date: Optional[datetime.date]
    filter_pango_lineages: Optional[List[constr(regex=r"^[0-9A-Za-z. *\/]+$")]]  # type: ignore # noqa
    location_id: Optional[int]  # if not specified, will use group default


class PhyloRunRequest(BaseRequest):
    # mypy + pydantic is a work in progress: https://github.com/samuelcolvin/pydantic/issues/156
    name: constr(min_length=1, max_length=128, strict=True)  # type: ignore
    samples: List[StrictStr]
    tree_type: StrictStr
    template_args: Optional[TemplateArgsRequest]

    @validator("tree_type")
    def tree_type_must_be_supported(cls, value):
        uppercase_tree_type = value.upper()
        assert uppercase_tree_type in PHYLO_TREE_TYPES
        return uppercase_tree_type


class GroupResponse(BaseResponse):
    class Config:
        orm_mode = True

    id: int
    name: StrictStr
    location: Optional[StrictStr]


class UserResponse(BaseResponse):
    id: int
    name: str


class TreeResponse(BaseResponse):
    id: int
    name: Optional[str]


class PhyloRunResponse(BaseResponse):
    class Config:
        orm_mode = True
        allow_population_by_field_name = True

    # Return the first phylo tree output. We only expect one, and for this to
    # work right, this *depends on our query filtering out other output types!*
    @validator("contextual_repository", pre=True)
    def resolve_contextual_repository(cls, v):
        return v.name

    # Return the first phylo tree output. We only expect one, and for this to
    # work right, this *depends on our query filtering out other output types!*
    @validator("outputs", pre=True)
    def resolve_tree(cls, v):
        for output in v:
            return output

    # Workarounds for our SQLAlchemy enums
    @validator("tree_type", "workflow_status", pre=True)
    def resolve_enums(cls, v):
        if isinstance(v, str):
            return v
        return v.value

    @root_validator(pre=False)
    def _set_fields(cls, values: dict) -> dict:
        if values["name"]:
            return values

        # Generate a nice tree name if one doesn't exist
        # template_args should be transparently deserialized into a python dict.
        # but if something is wrong with the data in the column (i.e. the json is
        # double escaped), it will be a string instead.
        location = values["group"].location
        if values["outputs"]:
            values["name"] = values["outputs"].name
            return values

        if isinstance(values["template_args"], Dict):
            template_args = values["template_args"]
            location = template_args.get("location", location)
        values[
            "name"
        ] = f"{location} Tree {values['start_datetime'].strftime('%Y-%m-%d')}"
        return values

    id: int
    start_datetime: datetime.datetime
    end_datetime: Optional[datetime.datetime]
    workflow_status: str
    template_args: Dict
    name: Optional[str]
    group: GroupResponse
    template_file_path: Optional[StrictStr]
    tree_type: Optional[str]
    pathogen: Optional[PathogenResponse]
    contextual_repository: str = Field(alias='contextual_data_source')
    user: Optional[UserResponse]

    # This lets us remap phlo_run.outputs to phylo_run.phylo_tree using the validator above
    outputs: Optional[TreeResponse] = Field(alias="phylo_tree")


class PhyloRunDeleteResponse(BaseResponse):
    id: int


class PhyloRunsListResponse(BaseResponse):
    phylo_runs: List[PhyloRunResponse]


class PhyloRunUpdateRequest(BaseRequest):
    name: constr(min_length=1, max_length=128, strip_whitespace=True)  # type: ignore
