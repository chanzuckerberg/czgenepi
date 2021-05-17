from pathlib import Path, PosixPath
from tempfile import NamedTemporaryFile

from click.testing import CliRunner

from aspen.cli import db
from aspen.database.connection import SqlAlchemyInterface
from aspen.workflows.pangolin.tests.test_pangolin_workflow import create_test_data


def test_create_mega_fasta(mocker, session, postgres_database):

    create_test_data(session)
    public_identifiers_txt = Path(
        Path(__file__).parent, "data", "public_identifiers.txt"
    )

    with NamedTemporaryFile() as output_fh:
        runner = CliRunner()
        result = runner.invoke(
            db.create_mega_fasta,
            [
                "--public-identifier-txt",
                public_identifiers_txt,
                "--sequences-output",
                output_fh.name,
            ],
            obj={"ENGINE": SqlAlchemyInterface(session.bind.engine)},
        )
        assert result.exit_code == 0

        lines = output_fh.read()
        assert lines == b">public_identifier_1\nTCGGCG\n>public_identifier_2\nTCGGCG\n"
