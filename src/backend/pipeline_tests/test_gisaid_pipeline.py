import datetime

import sqlalchemy as sa

from aspen.database.models import (
    AlignedRepositoryData,
    Location,
    Pathogen,
    PublicRepository,
    PublicRepositoryMetadata,
    Workflow,
)


def test_public_repo_db_objects_were_created(session):
    sample = (
        session.execute(
            sa.select(PublicRepositoryMetadata)
            .where(PublicRepositoryMetadata.strain == "Wuhan/TEST_SAMPLE/2019")
            .join(Pathogen)
            .join(PublicRepository)
            .where(PublicRepository.name == "GISAID")
            .where(Pathogen.slug == "SC2")
        )
        .scalars()
        .one()
    )
    assert sample.strain == "Wuhan/TEST_SAMPLE/2019"
    assert sample.lineage == "B"
    assert sample.region == "Asia"
    assert sample.country == "China"
    assert sample.division == "Hubei"
    assert sample.location == "Test Location"
    assert sample.isl == "TEST_EPI_ISL_123"


def test_new_workflow_artifacts_exist(session):
    aligned_dump = (
        session.execute(  # type: ignore
            sa.select(AlignedRepositoryData)  # type: ignore
            .join(AlignedRepositoryData.producing_workflow)  # type: ignore
            .order_by(Workflow.end_datetime.desc())  # type: ignore
            .limit(1)  # type: ignore
        )
        .scalars()
        .one()
    )

    today = datetime.datetime.now().strftime("%Y%m%d")
    assert today in aligned_dump.sequences_s3_key
    assert today in aligned_dump.metadata_s3_key


def test_locations_import(session):
    location = (
        session.execute(  # type: ignore
            sa.select(Location)  # type: ignore
            .where(Location.location == "Test Location")  # type: ignore
            .limit(1)  # type: ignore
        )
        .scalars()
        .one()
    )

    assert location.region == "Asia"
    assert location.country == "China"
    assert location.division == "Hubei"
    assert location.location == "Test Location"
