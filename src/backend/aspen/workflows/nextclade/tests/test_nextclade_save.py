from pathlib import Path, PosixPath

from click.testing import CliRunner, Result

from aspen.database.models import (
    Group,
    LineageType,
    Sample,
    SampleLineage,
    SampleMutation,
    SampleQCMetric,
)
from aspen.database.models.sample import Sample
from aspen.database.models.sequences import UploadedPathogenGenome
from aspen.database.models.usergroup import Group
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.pathogen import random_pathogen_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_factory
from aspen.test_infra.models.usergroup import group_factory, user_factory
from aspen.workflows.nextclade.save import cli as save_cli


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

    return group, samples, pathogen_genomes


def mock_remote_db_uri(mocker, test_postgres_db_uri):
    mocker.patch(
        "aspen.config.config.Config.DATABASE_URI",
        new_callable=mocker.PropertyMock,
        return_value=test_postgres_db_uri,
    )


def test_nextclade_save_new_entries(mocker, session, postgres_database):

    group, samples, pathogen_genomes = create_test_data(session)
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    nextclade_csv: PosixPath = Path(Path(__file__).parent, "data", "nextclade.csv")

    runner: CliRunner = CliRunner()
    result: Result = runner.invoke(
        save_cli,
        [
            "--nextclade-csv",
            nextclade_csv,
            "--nextclade-version",
            "v1.1",
            "--group-name",
            group.name,
            "--pathogen-slug",
            "MPX",
        ],
    )

    assert result.exit_code == 0

    # start new transaction
    session.close()
    session.begin()

    sample = (
        session.query(Sample)
        .filter(Sample.public_identifier == "public_identifier_1")
        .one()
    )

    qc_metrics = (
        session.query(SampleQCMetric).filter(SampleQCMetric.sample == sample).one()
    )
    lineage = session.query(SampleLineage).filter(SampleLineage.sample == sample).one()

    # matched against values from test nextclade.csv in test data directory
    assert qc_metrics.qc_score == "18.062500"
    assert qc_metrics.qc_status == "good"
    assert qc_metrics.qc_software_version == "v1.1"
    assert lineage.lineage == "21J (Delta)"


def test_nextclade_save_overwrite(mocker, session, postgres_database):

    group, samples, pathogen_genomes = create_test_data(session)
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    # create QC metrics, Mutations, and Lineage entries
    sample = (
        session.query(Sample)
        .filter(Sample.public_identifier == "public_identifier_1")
        .one()
    )
    qc_metrics = SampleQCMetric(
        sample=sample,
        qc_score="1",
        qc_status="mediocre",
        raw_qc_output="",
        qc_software_version="v1",
    )
    mutation = SampleMutation(
        sample=sample,
        substitutions="AA",
        insertions="BB",
        deletions="CC",
        aa_substitutions="DD",
        aa_insertions="EE",
        aa_deletions="FF",
    )
    lineage = SampleLineage(
        sample=sample,
        lineage_type=LineageType.NEXTCLADE,
        lineage_software_version="v1",
        lineage="B",
    )

    session.add(qc_metrics)
    session.add(mutation)
    session.add(lineage)
    session.commit()
    nextclade_csv: PosixPath = Path(Path(__file__).parent, "data", "nextclade.csv")

    runner: CliRunner = CliRunner()
    result: Result = runner.invoke(
        save_cli,
        [
            "--nextclade-csv",
            nextclade_csv,
            "--nextclade-version",
            "v1.1",
            "--group-name",
            group.name,
            "--pathogen-slug",
            "MPX",
        ],
    )

    assert result.exit_code == 0

    # start new transaction
    session.close()
    session.begin()

    sample = (
        session.query(Sample)
        .filter(Sample.public_identifier == "public_identifier_1")
        .one()
    )

    qc_metrics = (
        session.query(SampleQCMetric).filter(SampleQCMetric.sample == sample).one()
    )
    lineage = session.query(SampleLineage).filter(SampleLineage.sample == sample).one()

    # matched against values from test nextclade.csv in test data directory
    assert qc_metrics.qc_score == "18.062500"
    assert qc_metrics.qc_status == "good"
    assert qc_metrics.qc_software_version == "v1.1"
    assert lineage.lineage == "21J (Delta)"
