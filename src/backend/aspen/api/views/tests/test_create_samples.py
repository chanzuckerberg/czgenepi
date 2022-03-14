import datetime

import pytest
import sqlalchemy as sa
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from aspen.app.views import api_utils
from aspen.database.models import Sample, UploadedPathogenGenome
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.usergroup import group_factory, user_factory

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


# test CREATE samples #


async def test_samples_create_view_pass_no_public_id(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    group = group_factory()
    user = user_factory(group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    async_session.add(group)
    async_session.add(location)
    await async_session.commit()
    test_date = datetime.datetime.now()

    data = [
        {
            "sample": {
                "private_identifier": "private",
                "collection_date": api_utils.format_date(test_date),
                "location_id": location.id,
                "private": True,
            },
            "pathogen_genome": {
                "sequence": "AAAKAANTCG",
                "sequencing_date": api_utils.format_date(test_date),
            },
        },
        {
            "sample": {
                "private_identifier": "private2",
                "collection_date": api_utils.format_date(test_date),
                "location_id": location.id,
                "private": True,
            },
            "pathogen_genome": {
                "sequence": "AACTGTNNNN",
                "sequencing_date": api_utils.format_date(test_date),
            },
        },
    ]
    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.post(
        "/v2/samples/",
        json=data,
        headers=auth_headers,
    )
    assert res.status_code == 200
    await async_session.close()
    async_session.begin()

    samp_res = await async_session.execute(
        sa.select(Sample).filter(Sample.private_identifier.in_(["private", "private2"]))
    )
    samples = samp_res.scalars().all()
    upg_res = await async_session.execute(sa.select(UploadedPathogenGenome))
    uploaded_pathogen_genomes = upg_res.scalars().all()

    assert len(samples) == 2
    assert len(uploaded_pathogen_genomes) == 2
    # check that creating new public identifiers works
    sample_res = await async_session.execute(sa.select(Sample))
    public_ids = sorted([i.public_identifier for i in sample_res.scalars().all()])
    datetime.datetime.now().year
    assert [
        f"hCoV-19/USA/groupname-1/{test_date.year}",
        f"hCoV-19/USA/groupname-2/{test_date.year}",
    ] == public_ids

    sample_1_q = await async_session.execute(
        sa.select(Sample)
        .options(joinedload(Sample.uploaded_pathogen_genome))
        .filter(Sample.private_identifier == "private")
    )
    sample_1 = sample_1_q.scalars().one()

    assert sample_1.uploaded_pathogen_genome.num_mixed == 1
    assert sample_1.uploaded_pathogen_genome.num_unambiguous_sites == 8
    assert sample_1.uploaded_pathogen_genome.num_missing_alleles == 1
