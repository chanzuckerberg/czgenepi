from typing import Optional

import sqlalchemy as sa

from aspen.database.models import PublicRepository
from aspen.database.models.usergroup import generate_random_id
from aspen.util.split import SplitClient


# TODO this should be the functionality we use everywhere.
def random_repo_factory(name: Optional[str] = None) -> PublicRepository:
    if not name:
        name = generate_random_id(10)
    return PublicRepository(name=name)


def random_default_repo_factory(split_client: SplitClient) -> PublicRepository:
    name = generate_random_id(10)
    split_client.get_pathogen_treatment.return_value = name
    return PublicRepository(name=name)


# TODO: we need to replace this hardcoded pathogen defaults method with the one above that generates random pathogens.
def public_repo_factory(name: Optional[str] = None) -> PublicRepository:
    if not name:
        name = "GISAID"
    return PublicRepository(name=name)


def get_repo_sync(session, name: str):
    return (
        session.execute(sa.select(PublicRepository).where(PublicRepository.name == name))  # type: ignore
        .scalars()
        .one()
    )
