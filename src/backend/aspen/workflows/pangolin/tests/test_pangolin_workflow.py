from datetime import datetime
from pathlib import Path, PosixPath

from click.testing import CliRunner, Result

from aspen.database.models.sample import Sample
from aspen.database.models.sequences import UploadedPathogenGenome
from aspen.database.models.usergroup import Group
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_factory
from aspen.test_infra.models.usergroup import group_factory
from aspen.workflows.pangolin.export import cli as export_cli
from aspen.workflows.pangolin.save import cli as save_cli


def create_test_data(session):
    group: Group = group_factory()

    for i in range(1, 3):
        sample: Sample = sample_factory(
            group,
            private_identifier=f"private_identifier_{i}",
            public_identifier=f"public_identifier_{i}",
        )
        session.add(sample)
        pathogen_genome: UploadedPathogenGenome = uploaded_pathogen_genome_factory(
            sample
        )
        session.add(pathogen_genome)
        session.commit()


def mock_remote_db_uri(mocker, test_postgres_db_uri):
    mocker.patch(
        "aspen.config.config.RemoteDatabaseConfig.DATABASE_URI",
        new_callable=mocker.PropertyMock,
        return_value=test_postgres_db_uri,
    )


def test_pangolin_export(mocker, session, postgres_database):

    create_test_data(session)
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    runner = CliRunner()
    result = runner.invoke(
        export_cli,
        [
            "--sequences",
            "test.fa",
            "--sample-public-identifier",
            "public_identifier_1",
            "--sample-public-identifier",
            "public_identifier_2",
        ],
    )
    assert result.exit_code == 0
    with open("test.fa", "r") as fh:
        lines = fh.read()
        assert lines == ">1\nTCGGCG>2\nTCGGCG"


def test_pangolin_save(mocker, session, postgres_database):

    create_test_data(session)
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    pangolin_csv: PosixPath = Path(Path(__file__).parent, "data", "lineage_report.csv")

    runner: CliRunner = CliRunner()
    result: Result = runner.invoke(
        save_cli,
        ["--pangolin-csv", pangolin_csv, "--pangolin-last-updated", "05-03-2021"],
    )
    assert result.exit_code == 0

    # start new transaction
    session.close()
    session.begin()

    for i in range(1, 3):
        pathogen_genome: UploadedPathogenGenome = (
            session.query(UploadedPathogenGenome)
            .filter(UploadedPathogenGenome.entity_id == i)
            .one()
        )
        assert pathogen_genome.pangolin_lineage == "B.1.590"
        assert pathogen_genome.pangolin_probability == 1.0
        assert pathogen_genome.pangolin_last_updated == datetime.strptime(
            "05-03-2021", "%m-%d-%Y"
        )
        assert pathogen_genome.pangolin_version == "2021-04-23"
