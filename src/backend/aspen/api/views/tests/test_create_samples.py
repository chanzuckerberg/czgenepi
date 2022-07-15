import datetime
from typing import Optional

import pytest
import sqlalchemy as sa
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from aspen.database.models import PathogenGenome, Sample, UploadedPathogenGenome
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.usergroup import group_factory, userrole_factory

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


VALID_SEQUENCE = "AGTCAGTCAG" * 100  # 1000 char minimum sample length


def format_date(dt: Optional[datetime.date], format="%Y-%m-%d") -> str:
    if dt is not None:
        return dt.strftime(format)
    else:
        return "N/A"


# test CREATE samples #
async def test_samples_create_view_pass_no_public_id(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    group = group_factory()
    user = await userrole_factory(async_session, group)
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
                "collection_date": format_date(test_date),
                "location_id": location.id,
                "private": True,
            },
            "pathogen_genome": {
                "sequence": VALID_SEQUENCE + "MN",
                "sequencing_date": format_date(test_date),
            },
        },
        {
            "sample": {
                "private_identifier": "private2",
                "collection_date": format_date(test_date),
                "location_id": location.id,
                "private": True,
            },
            "pathogen_genome": {
                "sequence": VALID_SEQUENCE + "MN",
                "sequencing_date": format_date(test_date),
            },
        },
    ]
    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.post(
        f"/v2/orgs/{group.id}/samples/",
        json=data,
        headers=auth_headers,
    )
    assert [row["private_identifier"] for row in res.json()["samples"]] == [
        "private",
        "private2",
    ]
    assert res.status_code == 200
    await async_session.close()
    async_session.begin()

    samp_res = await async_session.execute(
        sa.select(Sample).filter(Sample.private_identifier.in_(["private", "private2"]))  # type: ignore
    )
    samples = samp_res.scalars().all()
    upg_res = await async_session.execute(sa.select(UploadedPathogenGenome))  # type: ignore
    uploaded_pathogen_genomes = upg_res.scalars().all()

    assert len(samples) == 2
    assert len(uploaded_pathogen_genomes) == 2
    # check that creating new public identifiers works
    sample_res = await async_session.execute(sa.select(Sample))  # type: ignore
    public_ids = sorted([i.public_identifier for i in sample_res.scalars().all()])
    assert [
        f"hCoV-19/USA/groupname-1/{test_date.year}",
        f"hCoV-19/USA/groupname-2/{test_date.year}",
    ] == public_ids

    sample_1_q = await async_session.execute(
        sa.select(Sample)  # type: ignore
        .options(joinedload(Sample.uploaded_pathogen_genome))
        .filter(Sample.private_identifier == "private")
    )
    sample_1 = sample_1_q.scalars().one()

    assert sample_1.uploaded_pathogen_genome.num_mixed == 1
    assert sample_1.uploaded_pathogen_genome.num_unambiguous_sites == 1000
    assert sample_1.uploaded_pathogen_genome.num_missing_alleles == 1


async def test_authz_failure(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    no_access_group = group_factory(name="Unauthorized")
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    async_session.add(no_access_group)
    async_session.add(group)
    async_session.add(location)
    await async_session.commit()
    test_date = datetime.datetime.now()

    data = [
        {
            "sample": {
                "private_identifier": "private",
                "public_identifier": "public",
                "collection_date": format_date(test_date),
                "location_id": location.id,
                "private": True,
            },
            "pathogen_genome": {
                "sequence": VALID_SEQUENCE,
                "sequencing_date": "",
            },
        },
    ]
    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.post(
        f"/v2/orgs/{no_access_group.id}/samples/",
        json=data,
        headers=auth_headers,
    )
    assert res.status_code == 403


async def test_stripping_whitespace(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    group = group_factory()
    user = await userrole_factory(async_session, group)
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
                "private_identifier": "\t   private   ",
                "public_identifier": "   public   ",
                "collection_date": format_date(test_date),
                "location_id": location.id,
                "private": True,
            },
            "pathogen_genome": {
                "sequence": f"     {VALID_SEQUENCE}   ",
                "sequencing_date": "",
            },
        },
    ]
    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.post(
        f"/v2/orgs/{group.id}/samples/",
        json=data,
        headers=auth_headers,
    )
    assert res.status_code == 200
    await async_session.commit()

    sample = (
        (
            await async_session.execute(
                sa.select(Sample)  # type: ignore
                .options(
                    joinedload(Sample.uploaded_pathogen_genome).undefer(  # type: ignore
                        PathogenGenome.sequence
                    ),
                )
                .filter(Sample.private_identifier == "private")
            )
        )
        .scalars()
        .one()
    )

    assert sample.uploaded_pathogen_genome.sequence == VALID_SEQUENCE
    assert sample.public_identifier == "public"
    assert sample.private_identifier == "private"


async def test_samples_create_view_pass_no_sequencing_date(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    group = group_factory()
    user = await userrole_factory(async_session, group)
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
                "public_identifier": "",
                "collection_date": format_date(test_date),
                "location_id": location.id,
                "private": True,
            },
            "pathogen_genome": {
                "sequence": VALID_SEQUENCE + "NM",
                "sequencing_date": "",
            },
        },
        {
            "sample": {
                "private_identifier": "private2",
                "public_identifier": "",
                "collection_date": format_date(test_date),
                "location_id": location.id,
                "private": True,
            },
            "pathogen_genome": {
                "sequence": VALID_SEQUENCE + "NM",
                "sequencing_date": test_date.strftime("%Y-%m-%d"),
            },
        },
    ]
    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.post(
        f"/v2/orgs/{group.id}/samples/",
        json=data,
        headers=auth_headers,
    )
    assert res.status_code == 200
    await async_session.commit()

    res = await async_session.execute(
        sa.select(Sample).filter(Sample.private_identifier.in_(["private", "private2"]))  # type: ignore
    )
    samples = res.scalars().all()  # type: ignore
    uploaded_pathogen_genomes = (
        (await async_session.execute(sa.select(UploadedPathogenGenome))).scalars().all()  # type: ignore
    )

    assert len(samples) == 2
    assert len(uploaded_pathogen_genomes) == 2
    # check that creating new public identifiers works
    public_ids = sorted(
        [
            i.public_identifier
            for i in (await async_session.execute(sa.select(Sample))).scalars().all()  # type: ignore
        ]
    )
    assert [
        f"hCoV-19/USA/groupname-1/{test_date.year}",
        f"hCoV-19/USA/groupname-2/{test_date.year}",
    ] == public_ids

    sample_1 = (
        (
            await async_session.execute(
                sa.select(Sample)  # type: ignore
                .options(joinedload(Sample.uploaded_pathogen_genome))  # type: ignore
                .filter(Sample.private_identifier == "private")
            )
        )
        .scalars()
        .one()
    )

    assert sample_1.uploaded_pathogen_genome.num_mixed == 1
    assert sample_1.uploaded_pathogen_genome.num_unambiguous_sites == 1000
    assert sample_1.uploaded_pathogen_genome.num_missing_alleles == 1


async def test_samples_create_view_invalid_sequence(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    async_session.add(group)
    async_session.add(location)
    await async_session.commit()

    data = [
        {
            "sample": {
                "private_identifier": "private",
                "public_identifier": "",
                "collection_date": format_date(datetime.datetime.now()),
                "location_id": location.id,
                "private": True,
            },
            "pathogen_genome": {
                "sequence": "0123456789" * 100,
                "sequencing_date": "2020-01-01",
            },
        },
    ]
    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.post(
        f"/v2/orgs/{group.id}/samples/",
        json=data,
        headers=auth_headers,
    )
    assert res.status_code == 422
    assert res.json() == {
        "detail": [
            {
                "ctx": {"pattern": "^[WSKMYRVHDBNZNATCGUwskmyrvhdbnznatcgu-]+$"},
                "loc": ["body", 0, "pathogen_genome", "sequence"],
                "msg": "string does not match regex "
                '"^[WSKMYRVHDBNZNATCGUwskmyrvhdbnznatcgu-]+$"',
                "type": "value_error.str.regex",
            }
        ],
    }


async def test_samples_create_view_fail_duplicate_ids(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    async_session.add(group)
    sample = sample_factory(
        group, user, location, private_identifier="private", public_identifier="public"
    )
    async_session.add(sample)
    async_session.add(location)
    await async_session.commit()

    data = [
        {
            "sample": {
                "private_identifier": "private",
                "public_identifier": "public",
                "collection_date": format_date(datetime.datetime.now()),
                "location_id": location.id,
                "private": True,
            },
            "pathogen_genome": {
                "sequence": VALID_SEQUENCE,
                "sequencing_date": "2020-01-01",
            },
        },
        {
            "sample": {
                "private_identifier": "private1",
                "public_identifier": "",
                "collection_date": format_date(datetime.datetime.now()),
                "location_id": location.id,
                "private": True,
            },
            "pathogen_genome": {
                "sequence": VALID_SEQUENCE,
                "sequencing_date": "2020-01-01",
            },
        },
    ]
    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.post(
        f"/v2/orgs/{group.id}/samples/",
        json=data,
        headers=auth_headers,
    )
    assert res.status_code == 400
    assert res.json() == {
        "error": "Error inserting data, private_identifiers ['private'] or "
        "public_identifiers: ['public'] already exist in our database, "
        "please remove these samples before proceeding with upload."
    }


async def test_samples_create_view_fail_duplicate_ids_in_request_data(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    async_session.add(group)
    sample = sample_factory(
        group, user, location, private_identifier="private", public_identifier="public"
    )
    async_session.add(sample)
    async_session.add(location)
    await async_session.commit()

    data = [
        {
            "sample": {
                "private_identifier": "private",
                "public_identifier": "public",
                "collection_date": format_date(datetime.datetime.now()),
                "location_id": location.id,
                "private": True,
            },
            "pathogen_genome": {
                "sequence": VALID_SEQUENCE,
                "sequencing_date": "2020-01-01",
            },
        },
        {
            "sample": {
                "private_identifier": "private",
                "public_identifier": "",
                "collection_date": format_date(datetime.datetime.now()),
                "location_id": location.id,
                "private": True,
            },
            "pathogen_genome": {
                "sequence": VALID_SEQUENCE,
                "sequencing_date": "2020-01-01",
            },
        },
    ]
    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.post(
        f"/v2/orgs/{group.id}/samples/",
        json=data,
        headers=auth_headers,
    )
    assert res.status_code == 400
    assert res.json() == {
        "error": "Error processing data, either duplicate private_identifiers: "
        "['private'] or duplicate public identifiers: [] exist in the upload "
        "files, please rename duplicates before proceeding with upload.",
    }


async def test_samples_create_view_fail_missing_required_fields(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    async_session.add(group)
    async_session.add(location)
    await async_session.commit()

    data = [
        {
            "sample": {
                "private_identifier": "private",
                "public_identifier": "",
                "collection_date": format_date(datetime.datetime.now()),
            },
            "pathogen_genome": {
                "sequence": VALID_SEQUENCE,
            },
        },
        {
            "sample": {
                "private_identifier": "private2",
                "collection_date": format_date(datetime.datetime.now()),
                "location_id": location.id,
                "private": True,
            },
            "pathogen_genome": {
                "sequence": VALID_SEQUENCE,
            },
        },
    ]
    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.post(
        f"/v2/orgs/{group.id}/samples/",
        json=data,
        headers=auth_headers,
    )
    assert res.status_code == 422
    assert res.json() == {
        "detail": [
            {
                "loc": ["body", 0, "sample", "private"],
                "msg": "field required",
                "type": "value_error.missing",
            },
            {
                "loc": ["body", 0, "sample", "location_id"],
                "msg": "field required",
                "type": "value_error.missing",
            },
        ]
    }
