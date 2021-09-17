import csv
from pathlib import Path
from tempfile import NamedTemporaryFile

from click.testing import CliRunner
from sqlalchemy import and_

from aspen.cli import db
from aspen.database.connection import SqlAlchemyInterface
from aspen.database.models import Sample
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.usergroup import group_factory, user_factory
from aspen.workflows.pangolin.tests.test_pangolin_workflow import create_test_data


def test_create_mega_fasta(session, postgres_database):

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


def test_update_public_ids(session, postgres_database):
    group = group_factory()
    user = user_factory(group)
    for i in range(0, 3):
        sample = sample_factory(
            group,
            user,
            private_identifier=f"private_{i}",
            public_identifier=f"public_{i}",
        )
        session.add(sample)

    session.add(group)
    session.commit()

    public_identifiers_csv = Path(
        Path(__file__).parent, "data", "private_to_public_identifiers.csv"
    )

    with open(public_identifiers_csv, "r") as fh:
        runner = CliRunner()
        result = runner.invoke(
            db.update_public_ids,
            [
                "--group-id",
                group.id,
                "--private-to-public-id-mapping",
                public_identifiers_csv,
            ],
            obj={"ENGINE": SqlAlchemyInterface(session.bind.engine)},
        )
        csvreader = csv.DictReader(fh)
        private_to_public = {row["private_id"]: row["public_id"] for row in csvreader}

    assert result.exit_code == 0

    updated_samples = (
        session.query(Sample)
        .filter(
            and_(
                Sample.submitting_group_id == group.id,
                Sample.private_identifier.in_(private_to_public.keys()),
            )
        )
        .all()
    )
    for s in updated_samples:
        assert s.public_identifier == private_to_public[s.private_identifier]
