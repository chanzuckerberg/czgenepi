from typing import Optional

import sqlalchemy as sa

from aspen.database.models import Pathogen


def pathogen_factory(
    slug: Optional[str] = None, name: Optional[str] = None
) -> Pathogen:
    if not slug:
        # TODO we should be randomly generating pathogens for tests
        # slug = generate_random_id(5)
        slug = "SC2"
    if not name:
        # TODO we should be randomly generating pathogens for tests
        # name = generate_random_id(10)
        name = "SARS-CoV-2"
    return Pathogen(slug=slug, name=name)


def get_pathogen_sync(session, slug: str):
    return (
        session.execute(sa.select(Pathogen).where(Pathogen.slug == slug))  # type: ignore
        .scalars()
        .one()
    )
