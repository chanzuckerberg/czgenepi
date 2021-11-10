import datetime
from typing import List, Union

from pydantic import constr, StrictStr, validator

from aspen.api.schemas.base import BaseRequest, BaseResponse
from aspen.database.models import TreeType, WorkflowStatusType

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


class UserResponse(BaseResponse):
    id: int
    name: str

class TreeResponse(BaseResponse):
    id: int


class PhyloRunResponse(BaseResponse):
    class Config:
        orm_mode = True

    #@validator('phylo_tree', pre=True, whole=True)
    #def validate_something(cls, v):
    #    for output in phylo_run.outputs:
    #        if isinstance(output, PhyloTree):
    #            return output

    id: int
    start_datetime: datetime.datetime
    end_datetime: Union[datetime.datetime, None] = None
    workflow_status: WorkflowStatusType  # TODO maybe we can keep SqlAlchemy out of this
    #group: GroupResponse
    template_file_path: Union[None, StrictStr]
    template_args: dict
    #user: Union[UserResponse, None] = None
    #phylo_tree: Union[TreeResponse, None] = None


class PhyloRunDeleteResponse(BaseResponse):
    id: int

class PhyloRunsListResponse(BaseResponse):
    phylo_runs: List[PhyloRunResponse]
