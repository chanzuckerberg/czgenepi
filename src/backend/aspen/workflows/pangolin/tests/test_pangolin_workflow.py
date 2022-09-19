from datetime import datetime
from pathlib import Path, PosixPath
from typing import Collection

from click.testing import CliRunner, Result

from aspen.database.models.sample import Sample
from aspen.database.models.sequences import UploadedPathogenGenome
from aspen.database.models.usergroup import Group
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.pathogen import random_pathogen_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_factory
from aspen.test_infra.models.usergroup import group_factory, user_factory
from aspen.workflows.pangolin.export import cli as export_cli
from aspen.workflows.pangolin.find_samples import find_samples
from aspen.workflows.pangolin.save import cli as save_cli


def create_test_data(session):
    group: Group = group_factory()
    pathogen = random_pathogen_factory()
    uploaded_by_user = user_factory(group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )

    samples = []
    pathogen_genomes = []
    for i in range(1, 3):
        sample: Sample = sample_factory(
            group,
            uploaded_by_user,
            location,
            pathogen=pathogen,
            private_identifier=f"private_identifier_{i}",
            public_identifier=f"public_identifier_{i}",
        )
        session.add(sample)
        samples.append(sample)
        pathogen_genome: UploadedPathogenGenome = uploaded_pathogen_genome_factory(
            sample,
            pangolin_lineage=None,
            pangolin_probability=None,
            pangolin_version=None,
            pangolin_last_updated=None,
        )
        session.add(pathogen_genome)
        pathogen_genomes.append(pathogen_genome)
        session.commit()

    return samples, pathogen_genomes


def mock_remote_db_uri(mocker, test_postgres_db_uri):
    mocker.patch(
        "aspen.config.config.Config.DATABASE_URI",
        new_callable=mocker.PropertyMock,
        return_value=test_postgres_db_uri,
    )


def test_pangolin_find_samples(mocker, session, postgres_database):

    samples, _ = create_test_data(session)
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    found_samples: Collection[str] = find_samples()

    assert found_samples == [sample.public_identifier for sample in samples]


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
        assert lines == ">1\nTCGGCG\n>2\nTCGGCG\n"


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

    for pathogen_genome in session.query(UploadedPathogenGenome).all():
        assert pathogen_genome.pangolin_lineage == "B"
        assert pathogen_genome.pangolin_probability == 100.0
        assert pathogen_genome.pangolin_last_updated == datetime.strptime(
            "05-03-2021", "%m-%d-%Y"
        )
        assert pathogen_genome.pangolin_version == "PANGO-v1.2.133"
