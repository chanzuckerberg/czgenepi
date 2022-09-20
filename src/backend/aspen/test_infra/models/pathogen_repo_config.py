from aspen.database.models import Pathogen, PathogenRepoConfig, PublicRepository
from aspen.test_infra.models.pathogen import random_pathogen_factory
from aspen.database.models.usergroup import generate_random_id


def setup_gisaid_and_genbank_repo_configs(async_session, pathogen=None) -> Pathogen:
    repo_info = {
        "GISAID": {"prefix": generate_random_id(5)},
        "GenBank": {"prefix": generate_random_id(5)},
    }
    if pathogen is None:
        pathogen = random_pathogen_factory()
        async_session.add(pathogen)
    for name, config in repo_info.items():
        public_repository = PublicRepository(name=name)
        async_session.add(public_repository)
        pathogen_repo_config = pathogen_repo_config_factory(
            config["prefix"], pathogen, public_repository
        )
        async_session.add(pathogen_repo_config)
    return pathogen


def pathogen_repo_config_factory(prefix, pathogen, public_repository):
    pathogen_repo_config = PathogenRepoConfig(
        prefix=prefix, pathogen=pathogen, public_repository=public_repository
    )

    return pathogen_repo_config
