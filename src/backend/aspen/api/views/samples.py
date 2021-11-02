import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.exc import NoResultFound
from starlette.requests import Request

from aspen.api.auth import get_auth_user
from aspen.api.deps import get_db, get_settings
from aspen.api.error import http_exceptions as ex
from aspen.api.schemas.samples import SampleDeleteResponse
from aspen.api.settings import Settings
from aspen.database.models import Sample, User

router = APIRouter()


@router.get("/")
async def list_samples(
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
) -> bool:
    return False


async def get_owned_sample_by_public_id(db, group_id, public_id, user):
    query = sa.select(Sample).filter(  # type: ignore
        sa.and_(
            Sample.submitting_group == user.group,  # This is an access control check!
            Sample.submitting_group_id
            == group_id,  # This makes sure we included the correct group ID in our path.
            Sample.public_identifier == public_id,
        )
    )
    results = await db.execute(query)
    try:
        return results.scalars().one()
    except NoResultFound:
        raise ex.NotFoundException("sample not found")


# Since our public identifiers typically contain / characters, we need to
# tell fastapi/starlette that it's ok to use the entire path suffix as our
# resource ID, using the `:path` convertor: https://www.starlette.io/routing/
@router.delete("/{group_id}/{public_id:path}")
async def delete_sample(
    group_id: int,
    public_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    user: User = Depends(get_auth_user),
) -> SampleDeleteResponse:
    # Make sure this sample exists and is delete-able by the current user.
    sample = await get_owned_sample_by_public_id(db, group_id, public_id, user)
    sample_db_id = sample.id

    await db.delete(sample)
    await db.commit()
    return SampleDeleteResponse(id=sample_db_id)
