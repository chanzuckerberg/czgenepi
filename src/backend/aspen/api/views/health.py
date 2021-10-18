from fastapi import APIRouter

from aspen.api.schemas.health import Health as healthschema

router = APIRouter()


@router.get("/", response_model=healthschema)
async def get_health() -> healthschema:
    raise Exception("Testing Sentry")
    return healthschema.parse_obj({"healthy": True})
