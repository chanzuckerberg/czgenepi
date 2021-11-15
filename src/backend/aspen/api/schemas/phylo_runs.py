import datetime
import re
from typing import Dict, List, Union

from pydantic import constr, Field, root_validator, StrictStr, validator

from aspen.api.schemas.base import BaseRequest, BaseResponse
from aspen.database.models import TreeType

# What kinds of ondemand nextstrain builds do we support?
PHYLO_TREE_TYPES = {
    TreeType.NON_CONTEXTUALIZED.value: "non_contextualized.yaml",
    TreeType.TARGETED.value: "targeted.yaml",
}


class PhyloRunRequest(BaseRequest):
    # mypy + pydantic is a work in progress: https://github.com/samuelcolvin/pydantic/issues/156
    name: constr(min_length=1, max_length=128, strict=True)  # type: ignore
    samples: List[StrictStr]
    tree_type: StrictStr

    @validator("tree_type")
    def tree_type_must_be_supported(cls, value):
        uppercase_tree_type = value.upper()
        assert PHYLO_TREE_TYPES.get(uppercase_tree_type)
        return uppercase_tree_type


class GroupResponse(BaseResponse):
    class Config:
        orm_mode = True

    id: int
    name: StrictStr
    location: StrictStr


class UserResponse(BaseResponse):
    id: int
    name: str


class TreeResponse(BaseResponse):
    # A root validator gets us access to all fields in a model, so if
    # we need to generate a field as a composite of other fields, this
    # is how we do it.
    @root_validator(pre=False)
    def _set_fields(cls, values: dict) -> dict:
        if values["name"]:
            return values

        # Generate a nice tree name if one doesn't exist
        json_filename = values["s3_key"].split("/")[-1]
        basename = re.sub(r".json", "", json_filename)
        title_case = basename.replace("_", " ").title()
        if "Ancestors" in title_case:
            title_case = title_case.replace("Ancestors", "Contextual")
        if " Public" in title_case:
            title_case = title_case.replace(" Public", "")
        if " Private" in title_case:
            title_case = title_case.replace(" Private", "")
        values["name"] = title_case

        # TODO, we need to include this field in the response model so we can interact
        # with it in this method, but ideally we don't want to return it at all.
        values["s3_key"] = None

        return values

    id: int
    name: Union[None, str] = None
    s3_key: Union[None, str] = None


class PhyloRunResponse(BaseResponse):
    class Config:
        orm_mode = True
        allow_population_by_field_name = True

    # Return the first phylo tree output. We only expect one, and for this to
    # work right, this *depends on our query filtering out other output types!*
    @validator("outputs", pre=True)
    def resolve_tree(cls, v):
        for output in v:
            return output

    # Workarounds for our SQLAlchemy enums
    @validator("tree_type", "workflow_status", pre=True)
    def resolve_enums(cls, v):
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
    end_datetime: Union[datetime.datetime, None] = None
    workflow_status: str
    template_args: Dict
    name: Union[str, None]
    group: GroupResponse
    template_file_path: Union[None, StrictStr]
    tree_type: Union[None, str]
    user: Union[UserResponse, None] = None

    # This lets us remap phlo_run.outputs to phylo_run.phylo_tree using the validator above
    outputs: Union[TreeResponse, None] = Field(alias="phylo_tree")



class PhyloRunDeleteResponse(BaseResponse):
    id: int


class PhyloRunsListResponse(BaseResponse):
    phylo_runs: List[PhyloRunResponse]
