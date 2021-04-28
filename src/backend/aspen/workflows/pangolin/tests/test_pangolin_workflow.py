from click.testing import CliRunner

from aspen.workflows.pangolin.export import cli
from aspen.test_infra.models.usergroup import group_factory, user_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_factory


def test_pangolin_export(mocker, session, postgres_database):
    group = group_factory()

    for i in range(0,2):
        sample = sample_factory(
            group,
            private_identifier=f"private_identifier_{i}",
            public_identifier=f"public_identifier_{i}"
        )
        session.add(sample)
        pathogen_genome = uploaded_pathogen_genome_factory(sample)
        session.add(pathogen_genome)
        session.commit()

    mocker.patch(
        "aspen.config.config.RemoteDatabaseConfig.DATABASE_URI",
        return_value=postgres_database.as_uri()
    )

    runner = CliRunner()
    result = runner.invoke(
        cli,
        [
            "--sequences",
            "test.fa",
            "--sample-public-identifier",
            "public_identifier_1",
            "--sample-public-identifier",
            "public_identifier_2"
        ]
    )
    print(result)



