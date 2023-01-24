import json

import sqlalchemy as sa

from aspen.database.models import Pathogen, PathogenLineage
from aspen.test_infra.models.pathogen import random_pathogen_factory
from aspen.workflows.import_lineages.load_lineages import (
    format_lineage_data,
    load_lineages_data,
)


def mock_remote_db_uri(mocker, test_postgres_db_uri):
    mocker.patch(
        "aspen.config.config.Config.DATABASE_URI",
        new_callable=mocker.PropertyMock,
        return_value=test_postgres_db_uri,
    )


# Make sure we can load mpx lineages from the structure maintained upstream.
def test_format_lineage_response(mocker, session, split_client, postgres_database):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    test_data = json.dumps(
        {
            "$schema": "https://foo.bar",
            "lineages": [
                {
                    "alias": "B",
                    "defining_snps": [],
                    "designation_date": "2022-06-10",
                    "name": "A.1.1",
                    "parent": "A.1",
                    "reference_sequences": [],
                    "unaliased_name": "A.1.1",
                },
                {"name": "A.1", "parent": "A", "unaliased_name": "A.1"},
                {"name": "A.2.1", "parent": "A.2", "unaliased_name": "A.2.1"},
                {"name": "A.2", "parent": "A", "unaliased_name": "A.2"},
                {"bad": "data", "here": "should", "be": "ignored"},
            ],
        }
    )
    res = format_lineage_data(test_data, "json", ["lineages"], ["name", "alias"])
    assert set(res) == {"A.1.1", "A.1", "B", "A.2.1", "A.2"}


# Make sure we can write lineages to the db.
def test_import_lineages(mocker, session, split_client, postgres_database):
    mock_remote_db_uri(mocker, postgres_database.as_uri())
    pathogen = random_pathogen_factory()
    session.add(pathogen)
    session.commit()

    lineages = ["A", "B.1.1", "C", "D.3.4.5"]

    load_lineages_data(pathogen.slug, lineages)
    lineage_rows = (
        session.execute(
            sa.select(PathogenLineage)
            .join(Pathogen)
            .where(Pathogen.slug == pathogen.slug)
        )
        .scalars()
        .all()
    )
    db_lineages = [item.lineage for item in lineage_rows]
    assert set(lineages) == set(db_lineages)
