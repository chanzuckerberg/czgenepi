from aspen.api.schemas.base import BaseRequest, BaseResponse
import datetime

from pydantic import BaseModel, ValidationError, validator, constr, StrictStr
from typing import List
from aspen.database.models import (
    WorkflowStatusType, 
    TreeType,
)

# What kinds of ondemand nextstrain builds do we support?
PHYLO_TREE_TYPES = {
    TreeType.NON_CONTEXTUALIZED.value: "non_contextualized.yaml",
    TreeType.TARGETED.value: "targeted.yaml",
}

class PhyloRunRequestSchema(BaseRequest):
    name: constr(min_length=1, max_length=128, strict=True)
    samples: List[StrictStr]
    tree_type: StrictStr

    @validator('tree_type')
    def tree_type_must_be_supported(cls, value):
        uppercase_tree_type = value.upper()
        assert PHYLO_TREE_TYPES.get(uppercase_tree_type)
        return uppercase_tree_type


class GroupResponseSchema(BaseResponse):
    class Config:
        orm_mode = True
    id: int
    name: StrictStr

class PhyloRunResponseSchema(BaseResponse):
    class Config:
        orm_mode = True
    id: int
    start_datetime: datetime.datetime
    end_datetime: datetime.datetime = None
    workflow_status: WorkflowStatusType  # TODO maybe we can keep SqlAlchemy out of this
    group: GroupResponseSchema
    template_file_path: StrictStr
    template_args: dict
