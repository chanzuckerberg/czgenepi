from typing import List

import sqlalchemy as sa
from fastapi import APIRouter, HTTPException
from pydantic import parse_obj_as

from aspen.api.deps import get_db
from aspen.api.schemas.health import Health as healthschema

router = APIRouter()


@router.get("/", response_model=healthschema)
async def get_health() -> healthschema:
    return healthschema.parse_obj({"healthy": True})
