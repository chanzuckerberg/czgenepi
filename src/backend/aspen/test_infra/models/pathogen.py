import sqlalchemy as sa

from aspen.database.models import Pathogen


def pathogen_factory(slug: str = "BP", name: str = "BadPathogen") -> Pathogen:
    return Pathogen(slug=slug, name=name)


def get_pathogen_sync(session, slug: str):
    return (
        session.execute(sa.select(Pathogen).where(Pathogen.slug == slug))  # type: ignore
        .scalars()
        .one()
    )
