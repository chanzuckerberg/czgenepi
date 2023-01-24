import random
from pathlib import Path, PosixPath
from typing import Collection

from click.testing import CliRunner, Result
from sqlalchemy.orm import undefer

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


def create_samples_for_pathogen(session, group, user, location, pathogen):
    pathogen_genomes = []
    samples = []
    for i in range(1, 3):
        sample: Sample = sample_factory(
            group,
            user,
            location,
            pathogen=pathogen,
            private_identifier=f"private_identifier_{pathogen.slug}_{i}",
            public_identifier=f"public_identifier_{pathogen.slug}_{i}",
        )
        session.add(sample)
        samples.append(sample)
        sequence = [item for item in "ATGCATGCATGCATGCATGC"]
        random.shuffle(sequence)
        pathogen_genome: UploadedPathogenGenome = uploaded_pathogen_genome_factory(
            sample,
            sequence="".join(sequence),
        )
        session.add(pathogen_genome)
        pathogen_genomes.append(pathogen_genome)
        session.commit()
    return samples, pathogen_genomes


def create_test_data(session):
    group: Group = group_factory()
    pathogen = random_pathogen_factory()
    extra_pathogen = random_pathogen_factory()
    uploaded_by_user = user_factory(group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )

    # Create samples for an unused pathogen (test that we're filtering for pathogens properly)
    _, _ = create_samples_for_pathogen(
        session, group, uploaded_by_user, location, extra_pathogen
    )

    # Create samples for a targeted pathogen
    samples, pathogen_genomes = create_samples_for_pathogen(
        session, group, uploaded_by_user, location, pathogen
    )

    return samples, pathogen_genomes, pathogen


def mock_remote_db_uri(mocker, test_postgres_db_uri):
    mocker.patch(
        "aspen.config.config.Config.DATABASE_URI",
        new_callable=mocker.PropertyMock,
        return_value=test_postgres_db_uri,
    )


def test_pangolin_find_samples(mocker, session, postgres_database):

    samples, _, pathogen = create_test_data(session)
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    found_samples: Collection[str] = find_samples(pathogen.slug)

    assert found_samples == [sample.public_identifier for sample in samples]


def _write_sample_ids(pathogen):
    found_samples: Collection[str] = find_samples(pathogen.slug)
    ids_filename = "/tmp/sample_ids.txt"
    with open(ids_filename, "w") as f:
        f.write("\n".join(found_samples))
    return ids_filename


def _run_sample_export(ids_filename):
    output_filename = "/tmp/test.fa"
    runner = CliRunner()
    result = runner.invoke(
        export_cli,
        ["--sequences", output_filename, "--sample-ids-file", ids_filename],
    )
    assert result.exit_code == 0
    return output_filename


def test_pangolin_export(mocker, session, postgres_database):

    samples, pathogen_genomes, pathogen = create_test_data(session)
    mock_remote_db_uri(mocker, postgres_database.as_uri())
    ids_filename = _write_sample_ids(pathogen)
    sequence_fasta = _run_sample_export(ids_filename)

    sequences = (
        session.query(UploadedPathogenGenome)
        .options(undefer(UploadedPathogenGenome.sequence))
        .where(UploadedPathogenGenome.sample_id.in_([sample.id for sample in samples]))
        .all()
    )
    expected = (
        "\n".join([f">{sequence.id}\n{sequence.sequence}" for sequence in sequences])
        + "\n"
    )
    with open(sequence_fasta, "r") as fh:
        lines = fh.read()
        assert lines == expected


def test_pangolin_save(mocker, session, postgres_database):

    _, _, pathogen = create_test_data(session)
    mock_remote_db_uri(mocker, postgres_database.as_uri())
    pathogen_slug = pathogen.slug

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
        sample = pathogen_genome.sample
        if sample.pathogen.slug != pathogen_slug:
            assert len(pathogen_genome.sample.lineages) == 0
            continue

        sample_lineage = pathogen_genome.sample.lineages[0]
        assert sample_lineage.lineage == "B"
        assert sample_lineage.lineage_probability == 100.0
        assert sample_lineage.lineage_software_version == "PANGO-v1.2.133"
