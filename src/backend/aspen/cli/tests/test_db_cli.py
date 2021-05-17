from pathlib import Path, PosixPath

from click.testing import CliRunner, Result

from aspen.database.models.sample import Sample
from aspen.database.models.sequences import UploadedPathogenGenome
from aspen.database.models.usergroup import Group
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_factory
from aspen.test_infra.models.usergroup import group_factory
from aspen.workflows.pangolin.tests.test_pangolin_workflow import create_test_data
from aspen.cli import db


def test_create_mega_fasta(mocker, session, postgres_database):

    samples, pathogen_genomes = create_test_data(session)

    runner = CliRunner()
    result = runner.invoke(
        db,

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
