from typing import Optional

import sqlalchemy as sa

from aspen.database.models import Pathogen
from aspen.database.models.usergroup import generate_random_id


def pathogen_factory(
    slug: Optional[str] = None, name: Optional[str] = None
) -> Pathogen:
    if not slug:
        slug = generate_random_id(5)
    if not name:
        name = generate_random_id(10)
    return Pathogen(slug=slug, name=name)


def get_pathogen_sync(session, slug: str):
    return (
        session.execute(sa.select(Pathogen).where(Pathogen.slug == slug))  # type: ignore
        .scalars()
        .one()
    )
