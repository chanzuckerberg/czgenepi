import random
from typing import Dict, Optional, Tuple

from aspen.database.models import Pathogen, PathogenRepoConfig, PublicRepository
from aspen.database.models.usergroup import generate_random_id
from aspen.test_infra.models.pathogen import random_pathogen_factory
from aspen.util.split import SplitClient


def pathogen_repo_config_factory(prefix, pathogen, public_repository):
    pathogen_repo_config = PathogenRepoConfig(
        prefix=prefix, pathogen=pathogen, public_repository=public_repository
    )

    return pathogen_repo_config


def setup_random_repo_configs(
    async_session,
    pathogen: Optional[Pathogen] = None,
    repos: Dict[str, str] = None,
    split_client: Optional[SplitClient] = None,
    default_repo: Optional[str] = None,
) -> Tuple[Pathogen, PathogenRepoConfig]:
    if not repos:
        repos = {
            generate_random_id(10): generate_random_id(5),
            generate_random_id(10): generate_random_id(5),
        }
    if not pathogen:
        pathogen = random_pathogen_factory()
        async_session.add(pathogen)
    repo_configs = {}
    for name, prefix in repos.items():
        public_repository = PublicRepository(name=name)
        async_session.add(public_repository)
        pathogen_repo_config = pathogen_repo_config_factory(
            prefix, pathogen, public_repository
        )
        repo_configs[public_repository.name] = pathogen_repo_config
        async_session.add(pathogen_repo_config)
    # Randomly choose a default pathogen repo config
    default_config = random.choice(list(repo_configs.values()))
    if default_repo:
        default_config = repo_configs[default_repo]
    if split_client:
        split_client.get_pathogen_treatment.return_value = (
            default_config.public_repository.name
        )
    return pathogen, default_config


def setup_gisaid_and_genbank_repo_configs(
    async_session,
    pathogen: Optional[Pathogen] = None,
    split_client: Optional[SplitClient] = None,
    default_repo: Optional[str] = None,
) -> Tuple[Pathogen, PathogenRepoConfig]:
    repos = {
        "GISAID": "hCoV-19",
        "GenBank": "SARS-CoV-2/human",
    }
    return setup_random_repo_configs(
        async_session, pathogen, repos, split_client, default_repo
    )
