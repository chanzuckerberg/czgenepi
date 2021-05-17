from pathlib import Path, PosixPath

from click.testing import CliRunner

from aspen.database.connection import SqlAlchemyInterface
from aspen.workflows.pangolin.tests.test_pangolin_workflow import create_test_data
from aspen.cli import db


def test_create_mega_fasta(mocker, session, postgres_database):

    create_test_data(session)
    public_identifiers_txt: PosixPath = Path(Path(__file__).parent, "data", "public_identifiers.txt")
    runner = CliRunner()
    result = runner.invoke(
        db.create_mega_fasta,
        [
            "--public-identifier-txt",
            public_identifiers_txt,
            "--sequences-output",
            "test.fa"
        ],
        obj={"ENGINE": SqlAlchemyInterface(session.bind.engine)}
    )
    assert result.exit_code == 0
    with open("test.fa", "r") as fh:
        lines = fh.read()
        assert lines == ">public_identifier_1\nTCGGCG\n>public_identifier_2\nTCGGCG\n"
