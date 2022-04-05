import datetime
from typing import Any, List, Optional

from pydantic import constr, validator
from pydantic.utils import GetterDict

from aspen.api.schemas.base import BaseRequest, BaseResponse

class SequenceRequest(BaseRequest):
    sample_ids: list[str]