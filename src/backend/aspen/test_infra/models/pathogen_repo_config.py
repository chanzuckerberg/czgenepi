from aspen.database.models import Pathogen, PathogenRepoConfig, PublicRepository


def setup_gisaid_and_genbank_repo_configs(async_session, pathogen=None) -> Pathogen:
    repo_info = {
        "GISAID": {"prefix": "hCoV-19"},
        "GenBank": {"prefix": "SARS-CoV-2/human"},
    }
    if pathogen is None:
        pathogen = Pathogen(slug="SC2", name="sars-cov-2")
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
