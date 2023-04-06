import csv
import uuid
from io import StringIO
from typing import List, Optional

import dateparser
import sqlalchemy as sa
import yaml
from sqlalchemy.sql.expression import and_

from aspen.database.models import Location, Pathogen, PublicRepositoryMetadata
from aspen.test_infra.models.pathogen import random_pathogen_factory
from aspen.test_infra.models.repository import random_default_repo_factory
from aspen.workflows.import_locations import save as import_locations


def create_test_data(session, split_client, metadata_rows):
    repository = random_default_repo_factory(split_client)
    pathogen = random_pathogen_factory()
    session.add(pathogen)
    session.add(repository)

    for row in metadata_rows:
        strain_name = str(uuid.uuid4())
        session.add(
            PublicRepositoryMetadata(
                pathogen=pathogen,
                public_repository=repository,
                strain=strain_name,
                region=row[0],
                country=row[1],
                division=row[2],
                location=row[3],
            )
        )
    session.commit()
    return pathogen


def mock_remote_db_uri(mocker, test_postgres_db_uri):
    mocker.patch(
        "aspen.config.config.Config.DATABASE_URI",
        new_callable=mocker.PropertyMock,
        return_value=test_postgres_db_uri,
    )


# Make sure the build config is working properly, and our location/group info is populated.
def test_friendly_data(mocker, session, split_client, postgres_database):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    input_metadata = [
        # Country level
        ["Asia", "Bangladesh", None, None],
        # Division level
        ["Asia", "Japan", "Hokkaido", None],
        ["Asia", "Japan", "Okinawa", None],
        # Location level
        ["Asia", "China", "Sichuan", "Chengdu"],
        ["Asia", "Japan", "Kansai", "Osaka"],
    ]
    pathogen = create_test_data(session, split_client, input_metadata)
    import_locations.save(pathogen.slug)

    expected = {
        # Country level
        ("Asia", "Bangladesh", None, None),
        ("Asia", "Japan", None, None),
        ("Asia", "China", None, None),
        # Division level
        ("Asia", "Japan", "Hokkaido", None),
        ("Asia", "Japan", "Okinawa", None),
        ("Asia", "China", "Sichuan", None),
        ("Asia", "Japan", "Kansai", None),
        # Location level
        ("Asia", "China", "Sichuan", "Chengdu"),
        ("Asia", "Japan", "Kansai", "Osaka"),
    }
    rows = session.execute(sa.select(Location)).scalars().all()
    found = {(item.region, item.country, item.division, item.location) for item in rows}
    assert expected == found


# Make sure the build config is working properly, and our location/group info is populated.
def test_mean_data(mocker, session, split_client, postgres_database):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    input_metadata = [
        # Region level
        ["Asia", "Bangladesh", None, None],
        # Country level
        ["Asia", "Bangladesh", "", None],
        ["Asia", "Bangladesh", "", None],
        ["Asia", "Bangladesh", None, None],
        # Division level
        ["Asia", "Japan", "Hokkaido", None],
        ["Asia", "Japan", "Hokkaido", None],
        ["Asia", "Japan", "Okinawa", None],
        ["Asia", "Japan", "Okinawa", None],
        # Location level
        ["Asia", "China", "Sichuan", "Chengdu"],
        ["Asia", "China", "Sichuan", "Chengdu"],
        ["Asia", "Japan", "Kansai", "Osaka"],
        ["Asia", "Japan", "Kansai", "Osaka"],
        ["Asia", "Japan", "Hokkaido", "Sapporo"],
        ["Asia", "Mongolia", "Dharkan-Uul", "Dharkan"],
    ]
    pathogen = create_test_data(session, split_client, input_metadata)
    import_locations.save(pathogen.slug)

    expected = {
        # Country level
        ("Asia", "Bangladesh", None, None),
        ("Asia", "Japan", None, None),
        ("Asia", "China", None, None),
        ("Asia", "Mongolia", None, None),
        # Division level
        ("Asia", "China", "Sichuan", None),
        ("Asia", "Japan", "Hokkaido", None),
        ("Asia", "Japan", "Kansai", None),
        ("Asia", "Japan", "Okinawa", None),
        ("Asia", "Mongolia", "Dharkan-Uul", None),
        # Location level
        ("Asia", "Japan", "Hokkaido", "Sapporo"),
        ("Asia", "China", "Sichuan", "Chengdu"),
        ("Asia", "Japan", "Kansai", "Osaka"),
        ("Asia", "Mongolia", "Dharkan-Uul", "Dharkan"),
    }
    rows = session.execute(sa.select(Location)).scalars().all()
    found = {(item.region, item.country, item.division, item.location) for item in rows}
    assert expected == found
