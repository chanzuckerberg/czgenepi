import datetime
from typing import Dict, List, Optional

from pydantic import constr, Field, root_validator, StrictStr, validator

from aspen.api.schemas.base import BaseRequest, BaseResponse
from aspen.api.schemas.pathogens import PathogenResponse
from aspen.database.models import TreeType

class TreeDownloadRequest(BaseRequest):
    group_id: int
