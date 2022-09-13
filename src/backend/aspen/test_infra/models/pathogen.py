from typing import Optional

import sqlalchemy as sa

from aspen.database.models import Pathogen
from aspen.database.models.usergroup import generate_random_id


# TODO this should be the functionality we use everywhere.
def random_pathogen_factory(
    slug: Optional[str] = None, name: Optional[str] = None
) -> Pathogen:
    if not slug:
        slug = generate_random_id(5)
    if not name:
        name = generate_random_id(10)
    return Pathogen(slug=slug, name=name)


# TODO: we need to replace this hardcoded pathogen defaults method with the one above that generates random pathogens.
def pathogen_factory(
    slug: Optional[str] = None, name: Optional[str] = None
) -> Pathogen:
    if not slug:
        slug = "SC2"
    if not name:
        name = "SARS-CoV-2"
    return Pathogen(slug=slug, name=name)


def get_pathogen_sync(session, slug: str):
    return (
        session.execute(sa.select(Pathogen).where(Pathogen.slug == slug))  # type: ignore
        .scalars()
        .one()
    )
