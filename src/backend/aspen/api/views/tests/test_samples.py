import json
from typing import Any, List, Optional, Tuple

import pytest
import sqlalchemy as sa
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from sqlalchemy.orm.exc import NoResultFound

from aspen.api.schemas.base import convert_datetime_to_iso_8601
from aspen.database.models import (
    Accession,
    Group,
    Location,
    Pathogen,
    Sample,
    SampleLineage,
    SampleQCMetric,
    UploadedPathogenGenome,
    User,
)
from aspen.test_infra.models.lineage import sample_lineage_factory
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.pathogen import pathogen_factory, random_pathogen_factory
from aspen.test_infra.models.repo_metadata import repo_metadata_factory
from aspen.test_infra.models.repository import random_default_repo_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.sample_qc_metrics import sample_qc_metrics_factory
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_factory
from aspen.test_infra.models.usergroup import (
    group_factory,
    grouprole_factory,
    userrole_factory,
)
from aspen.util.split import SplitClient

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


# test LIST samples #


async def test_samples_list(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    pangolin_output = {
        "scorpio_call": "B.1.167",
        "scorpio_support": "0.775",
        "qc_status": "pass",
    }

    sc2 = pathogen_factory("SC2", "SARS-Cov-2")
    mpx = pathogen_factory("MPX", "MPX")

    # Make multiple samples
    samples: List[Sample] = []
    uploaded_pathogen_genomes: List[UploadedPathogenGenome] = []
    qc_metrics: List[SampleQCMetric] = []
    sample_lineages: List[SampleLineage] = []
    for i in range(4):
        pathogen = sc2 if i < 2 else mpx
        samples.append(
            sample_factory(
                group,
                user,
                location,
                private=True,
                private_identifier=f"private{i}",
                public_identifier=f"public{i}",
                pathogen=pathogen,
            )
        )
        uploaded_pathogen_genomes.append(
            uploaded_pathogen_genome_factory(
                samples[i], pangolin_output=pangolin_output
            )
        )
        qc_metrics.append(sample_qc_metrics_factory(samples[i], qc_score=f"{i}"))
        if pathogen.slug == "SC2":
            sample_lineages.append(sample_lineage_factory(samples[i], raw_lineage_output=pangolin_output))
        else:
            sample_lineages.append(sample_lineage_factory(samples[i]))

    async_session.add(group)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    pathogen_specific = {  # type: ignore
        sc2: {
            "id_range": range(2),
            "url": f"/v2/orgs/{group.id}/pathogens/SC2/samples/",
        },
        mpx: {
            "id_range": range(2, 4),
            "url": f"/v2/orgs/{group.id}/pathogens/MPX/samples/",
        },
        # test support for old style urls
        "no pathogen": {
            "id_range": range(2),
            "url": f"/v2/orgs/{group.id}/samples/",
        },
    }
    for pathogen, params in pathogen_specific.items():  # type: ignore

        res = await http_client.get(
            params["url"],  # type: ignore
            headers=auth_headers,
        )
        response = res.json()
        if pathogen != "no pathogen":
            pathogen_data = {
                "id": pathogen.id,
                "slug": pathogen.slug,
                "name": pathogen.name,
            }
        else:
            # fill with sc2 as that is the current default
            pathogen_data = {
                "id": sc2.id,
                "slug": sc2.slug,
                "name": sc2.name,
            }
        expected = {
            "samples": [
                {
                    "id": samples[i].id,
                    "collection_date": str(samples[i].collection_date),
                    "collection_location": {
                        "id": location.id,
                        "region": location.region,
                        "country": location.country,
                        "division": location.division,
                        "location": location.location,
                    },
                    "czb_failed_genome_recovery": False,
                    "gisaid": {
                        "status": "Accepted",
                        "gisaid_id": samples[i].accessions[0].accession,
                    },
                    "pathogen": pathogen_data,
                    "private_identifier": samples[i].private_identifier,
                    "public_identifier": samples[i].public_identifier,
                    "uploaded_by": {"id": user.id, "name": user.name},
                    "upload_date": convert_datetime_to_iso_8601(
                        uploaded_pathogen_genomes[i].upload_date
                    ),
                    "sequencing_date": str(
                        uploaded_pathogen_genomes[i].sequencing_date
                    ),
                    "private": True,
                    "submitting_group": {
                        "id": group.id,
                        "name": group.name,
                    },
                    "qc_metrics": [
                        {
                            "qc_score": qc_metrics[i].qc_score,
                            "qc_software_version": qc_metrics[i].qc_software_version,
                            "qc_status": qc_metrics[i].qc_status,
                            "qc_caller": qc_metrics[i].qc_caller.value,
                            "reference_dataset_name": qc_metrics[i].reference_dataset_name,
                            "reference_sequence_accession": qc_metrics[i].reference_sequence_accession,
                            "reference_dataset_tag": qc_metrics[i].reference_dataset_tag,

                        }
                    ],
                    "lineages": [
                        {
                            "lineage_type": sample_lineages[i].lineage_type.value,
                            "lineage": sample_lineages[i].lineage,
                            "lineage_software_version": sample_lineages[
                                i
                            ].lineage_software_version,
                            "lineage_probability": sample_lineages[
                                i
                            ].lineage_probability,
                            "reference_dataset_name" : sample_lineages[i].reference_dataset_name,
                            "reference_sequence_accession": sample_lineages[i].reference_sequence_accession,
                            "reference_dataset_tag": sample_lineages[i].reference_dataset_tag,
                            "scorpio_call": sample_lineages[i].raw_lineage_output.get("scorpio_call"),
                            "scorpio_support": sample_lineages[i].raw_lineage_output.get("scorpio_support"),
                            "qc_status": qc_metrics[i].qc_status,
                        }
                    ],
                }
                for i in params["id_range"]  # type: ignore
            ]
        }
        assert response == expected

    # test that passing in a dud slug will raise exception
    res = await http_client.get(
        f"/v2/orgs/{group.id}/pathogens/WRONG/samples/",
        headers=auth_headers,
    )
    assert res.status_code == 400
    assert res.text == '{"error":"Invalid pathogen slug"}'


async def test_samples_view_gisaid_rejected(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    sc2 = pathogen_factory("SC2", "SARS-Cov-2")
    sample = sample_factory(group, user, location, accessions={}, pathogen=sc2)
    # Test no GISAID accession logic
    uploaded_pathogen_genome = uploaded_pathogen_genome_factory(
        sample,
    )

    async_session.add(group)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.get(
        f"/v2/orgs/{group.id}/pathogens/{sc2.slug}/samples/",
        headers=auth_headers,
    )
    response = res.json()
    expected = {
        "samples": [
            {
                "id": sample.id,
                "collection_date": str(sample.collection_date),
                "collection_location": {
                    "id": location.id,
                    "region": location.region,
                    "country": location.country,
                    "division": location.division,
                    "location": location.location,
                },
                "czb_failed_genome_recovery": False,
                "gisaid": {"status": "Not Found", "gisaid_id": None},
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": convert_datetime_to_iso_8601(
                    uploaded_pathogen_genome.upload_date
                ),
                "sequencing_date": str(uploaded_pathogen_genome.sequencing_date),
                "pathogen": {"id": sc2.id, "slug": sc2.slug, "name": sc2.name},
                "private": False,
                "submitting_group": {
                    "id": group.id,
                    "name": group.name,
                },
                "uploaded_by": {"id": user.id, "name": user.name},
                "qc_metrics": [],
                "lineages": [],
            }
        ]
    }
    assert response == expected


async def test_samples_view_gisaid_no_info(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    sc2 = pathogen_factory("SC2", "SARS-Cov-2")
    sample = sample_factory(group, user, location, accessions={}, pathogen=sc2)
    # Test no GISAID accession logic
    uploaded_pathogen_genome = uploaded_pathogen_genome_factory(
        sample,
    )

    async_session.add(group)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.get(
        f"/v2/orgs/{group.id}/pathogens/{sc2.slug}/samples/",
        headers=auth_headers,
    )
    response = res.json()

    expected = {
        "samples": [
            {
                "id": sample.id,
                "collection_date": str(sample.collection_date),
                "collection_location": {
                    "id": location.id,
                    "region": location.region,
                    "country": location.country,
                    "division": location.division,
                    "location": location.location,
                },
                "czb_failed_genome_recovery": False,
                "gisaid": {"status": "Not Found", "gisaid_id": None},
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": convert_datetime_to_iso_8601(
                    uploaded_pathogen_genome.upload_date
                ),
                "sequencing_date": str(uploaded_pathogen_genome.sequencing_date),
                "pathogen": {"id": sc2.id, "slug": sc2.slug, "name": sc2.name},
                "private": False,
                "submitting_group": {
                    "id": group.id,
                    "name": group.name,
                },
                "uploaded_by": {"id": user.id, "name": user.name},
                "qc_metrics": [],
                "lineages": [],
            }
        ]
    }
    assert response == expected


async def test_samples_view_gisaid_not_eligible(
    async_session: AsyncSession, http_client: AsyncClient
):
    group = group_factory()
    user = await userrole_factory(async_session, group)
    # Mark the sample as failed
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    sc2 = pathogen_factory("SC2", "SARS-Cov-2")
    sample = sample_factory(
        group, user, location, czb_failed_genome_recovery=True, pathogen=sc2
    )
    async_session.add(group)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.get(
        f"/v2/orgs/{group.id}/pathogens/{sc2.slug}/samples/",
        headers=auth_headers,
    )
    response = res.json()
    expected = {
        "samples": [
            {
                "id": sample.id,
                "collection_date": str(sample.collection_date),
                "collection_location": {
                    "id": location.id,
                    "region": location.region,
                    "country": location.country,
                    "division": location.division,
                    "location": location.location,
                },
                "czb_failed_genome_recovery": True,
                "gisaid": {"status": "Not Eligible", "gisaid_id": None},
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": None,
                # In some cases, `sequencing_date` could actually still exist with a
                # failed genome recovery, but for this test it's None because the sample
                # has no underlying sequenced entity (no uploaded_pathogen_genome).
                "sequencing_date": None,
                "pathogen": {"id": sc2.id, "slug": sc2.slug, "name": sc2.name},
                "private": False,
                "submitting_group": {
                    "id": group.id,
                    "name": group.name,
                },
                "uploaded_by": {"id": user.id, "name": user.name},
                "qc_metrics": [],
                "lineages": [],
            }
        ]
    }
    assert response == expected


# Helper function for cansee tests
async def _test_samples_view_cansee(
    async_session: AsyncSession,
    http_client: AsyncClient,
    group_roles: List[str],
    user_factory_kwargs: Optional[dict] = None,
) -> Tuple[Sample, UploadedPathogenGenome, Pathogen, Any]:
    user_factory_kwargs = user_factory_kwargs or {}
    owner_group = group_factory()
    viewer_group = group_factory(name="cdph")
    user = await userrole_factory(async_session, viewer_group, **user_factory_kwargs)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    sc2 = pathogen_factory("SC2", "SARS-Cov-2")
    sample = sample_factory(owner_group, user, location, pathogen=sc2)
    # create a private sample as well to make sure it doesn't get shown unless admin
    private_sample = sample_factory(
        owner_group,
        user,
        location,
        private=True,
        pathogen=sc2,
        private_identifier="private_id",
        public_identifier="public_id_2",
    )
    uploaded_pathogen_genome_factory(
        private_sample,
    )

    uploaded_pathogen_genome = uploaded_pathogen_genome_factory(sample)
    roles = []
    for role in group_roles:
        roles.extend(
            await grouprole_factory(async_session, owner_group, viewer_group, role)
        )
    async_session.add_all(roles + [owner_group, viewer_group])
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.get(
        f"/v2/orgs/{viewer_group.id}/pathogens/{sc2.slug}/samples/",
        headers=auth_headers,
    )
    response = res.json()

    return (
        sample,
        uploaded_pathogen_genome,
        sc2,
        response,
    )


async def test_samples_view_no_cansee(
    async_session: AsyncSession, http_client: AsyncClient
):
    _, _, _, response = await _test_samples_view_cansee(
        async_session,
        http_client,
        group_roles=[],
    )
    assert response["samples"] == []


async def test_samples_view_cansee(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    _, _, _, response = await _test_samples_view_cansee(
        async_session,
        http_client,
        group_roles=["viewer"],
    )

    # no private identifier in the output.
    samples = response["samples"]
    assert len(samples) == 1
    assert isinstance(samples[0].get("public_identifier", None), str)
    assert samples[0].get("private_identifier", None) is None


async def test_samples_view_cansee_all(
    async_session: AsyncSession,
    http_client: AsyncClient,
):

    (
        sample,
        uploaded_pathogen_genome,
        pathogen,
        response,
    ) = await _test_samples_view_cansee(
        async_session,
        http_client,
        group_roles=["viewer"],
    )

    # yes private identifier in the output.
    assert response["samples"] == [
        {
            "id": sample.id,
            "collection_date": str(sample.collection_date),
            "collection_location": {
                "id": sample.collection_location.id,
                "region": sample.collection_location.region,
                "country": sample.collection_location.country,
                "division": sample.collection_location.division,
                "location": sample.collection_location.location,
            },
            "czb_failed_genome_recovery": False,
            "gisaid": {
                "status": "Accepted",
                "gisaid_id": sample.accessions[0].accession,
            },
            "private_identifier": None,
            "public_identifier": sample.public_identifier,
            "upload_date": convert_datetime_to_iso_8601(
                uploaded_pathogen_genome.upload_date
            ),
            "sequencing_date": str(uploaded_pathogen_genome.sequencing_date),
            "pathogen": {
                "id": pathogen.id,
                "slug": pathogen.slug,
                "name": pathogen.name,
            },
            "private": False,
            "submitting_group": {
                "id": sample.submitting_group.id,
                "name": "groupname",
            },
            "uploaded_by": {
                "id": 1,
                "name": "test",
            },
            "qc_metrics": [],
            "lineages": [],
        }
    ]


async def test_samples_view_no_pangolin(
    async_session: AsyncSession, http_client: AsyncClient
):
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    sc2 = pathogen_factory("SC2", "SARS-Cov-2")
    sample = sample_factory(group, user, location, pathogen=sc2)
    uploaded_pathogen_genome = uploaded_pathogen_genome_factory(
        sample,
        pangolin_lineage=None,
        pangolin_probability=None,
        pangolin_version=None,
        pangolin_last_updated=None,
    )
    async_session.add(group)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.get(
        f"/v2/orgs/{group.id}/pathogens/{sc2.slug}/samples/",
        headers=auth_headers,
    )
    response = res.json()
    expected = {
        "samples": [
            {
                "id": sample.id,
                "collection_date": str(sample.collection_date),
                "collection_location": {
                    "id": location.id,
                    "region": location.region,
                    "country": location.country,
                    "division": location.division,
                    "location": location.location,
                },
                "czb_failed_genome_recovery": False,
                "gisaid": {
                    "status": "Accepted",
                    "gisaid_id": sample.accessions[0].accession,
                },
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": convert_datetime_to_iso_8601(
                    uploaded_pathogen_genome.upload_date
                ),
                "sequencing_date": str(uploaded_pathogen_genome.sequencing_date),
                "pathogen": {"id": sc2.id, "slug": sc2.slug, "name": sc2.name},
                "private": False,
                "submitting_group": {
                    "id": group.id,
                    "name": group.name,
                },
                "uploaded_by": {"id": user.id, "name": user.name},
                "qc_metrics": [],
                "lineages": [],
            }
        ]
    }
    assert response == expected


# test DELETE samples #


async def test_bulk_delete_sample_success(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test successful sample deletion by ID
    """
    pathogen: Pathogen = random_pathogen_factory()
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    samples = [
        sample_factory(
            group,
            user,
            location,
            pathogen=pathogen,
            public_identifier="path/to/sample_id1",
            private_identifier="i_dont_have_spaces1",
        ),
        sample_factory(
            group,
            user,
            location,
            pathogen=pathogen,
            public_identifier="path/to/sample id2",
            private_identifier="i have spaces2",
        ),
        sample_factory(
            group,
            user,
            location,
            pathogen=pathogen,
            public_identifier="path/to/sample_id3",
            private_identifier="i have spaces3",
        ),
    ]
    for sample in samples:
        upg = uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
        async_session.add(upg)
    async_session.add(group)
    await async_session.commit()

    body = {"ids": [sample.id for sample in samples]}
    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.request(
        "DELETE",
        f"/v2/orgs/{group.id}/pathogens/{pathogen.slug}/samples/",
        json=body,
        headers=auth_headers,
    )
    assert res.status_code == 200
    response = res.json()
    assert set(response["ids"]) == set(body["ids"])
    # Make sure all our samples were deleted
    rows = 0
    for sample in samples:
        res = await async_session.execute(
            sa.select(Sample).filter(Sample.id == sample.id)  # type: ignore
        )
        try:
            _ = res.scalars().one()  # type: ignore
        except NoResultFound:
            rows += 1
    # Make sure we actually processed the results above.
    assert rows == 3


async def test_delete_sample_success(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test successful sample deletion by ID
    """
    pathogen: Pathogen = random_pathogen_factory()
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    samples = [
        sample_factory(
            group,
            user,
            location,
            pathogen=pathogen,
            public_identifier="path/to/sample_id1",
            private_identifier="i_dont_have_spaces1",
        ),
        sample_factory(
            group,
            user,
            location,
            pathogen=pathogen,
            public_identifier="path/to/sample id2",
            private_identifier="i have spaces2",
        ),
        sample_factory(
            group,
            user,
            location,
            pathogen=pathogen,
            public_identifier="path/to/sample_id3",
            private_identifier="i have spaces3",
        ),
    ]
    for sample in samples:
        upg = uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
        async_session.add(upg)
    async_session.add(group)
    await async_session.commit()

    for sample in [samples[0], samples[1]]:
        auth_headers = {"user_id": user.auth0_user_id}
        res = await http_client.delete(
            f"/v2/orgs/{group.id}/pathogens/{pathogen.slug}/samples/{sample.id}",
            headers=auth_headers,
        )
        assert res.status_code == 200
        response = res.json()
        assert response["id"] == sample.id
    # Make sure 0 and 1 were deleted and 3 is still there.
    rows = 0
    for sample in samples:
        res = await async_session.execute(
            sa.select(Sample).filter(Sample.id == sample.id)  # type: ignore
        )
        try:
            row = res.scalars().one()  # type: ignore
        except NoResultFound:
            assert sample.id in [samples[0].id, samples[1].id]
            rows += 1
            continue
        assert row.id == samples[2].id
        rows += 1
    # Make sure we actually processed the results above.
    assert rows == 3

    # Check that Accessions were deleted
    rows = 0
    for sample in samples:
        res = await async_session.execute(
            sa.select(Accession).filter(Accession.sample_id == sample.id)  # type: ignore
        )
        row = res.scalars().all()  # type: ignore
        if not row:
            assert sample.id in [samples[0].id, samples[1].id]
            rows += 1
            continue
        for item in row:
            assert item.sample_id == samples[2].id
        rows += 1
    # Make sure we actually processed the results above.
    assert rows == 3


async def test_delete_sample_failures(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test a sample deletion failure by a user without write access
    """
    group = group_factory()
    pathogen = random_pathogen_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    sample = sample_factory(group, user, location, pathogen=pathogen)
    upg = uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    async_session.add(upg)
    async_session.add(group)

    # A group that doesn't have access to our sample.
    group2 = group_factory(name="The Other Group")
    user2 = await userrole_factory(
        async_session,
        group2,
        email="test_user@othergroup.org",
        auth0_user_id="other_test_auth0_id",
    )
    location2 = location_factory(
        "North America", "USA", "California", "San Francisco County"
    )
    sample2 = sample_factory(
        group2, user2, location2, pathogen=pathogen
    )  # A sample that user2 *can* delete
    async_session.add(group2)
    await async_session.commit()

    # Request this sample as a user who shouldn't be able to delete it.
    auth_headers = {"user_id": user2.auth0_user_id}
    res = await http_client.delete(
        f"/v2/orgs/{group.id}/pathogens/{pathogen.slug}/samples/{sample.id}",
        headers=auth_headers,
    )
    assert res.status_code == 403

    # Make sure this sample isn't found under the user's group context
    auth_headers = {"user_id": user2.auth0_user_id}
    res = await http_client.delete(
        f"/v2/orgs/{group2.id}/pathogens/{pathogen.slug}/samples/{sample.id}",
        headers=auth_headers,
    )
    assert res.status_code == 404

    # Make sure our sample is still in the db.
    res = await async_session.execute(sa.select(Sample).filter(Sample.id == sample.id))  # type: ignore
    found_sample = res.scalars().one()  # type: ignore
    assert found_sample.id == sample.id

    # Test that our multi-delete endpoint fails if any samples are denied
    # We're using .request() because httpx is opinionated:
    # https://www.python-httpx.org/compatibility/#request-body-on-http-methods
    res = await http_client.request(
        method="DELETE",
        url=f"/v2/orgs/{group.id}/pathogens/{pathogen.slug}/samples/",
        content=json.dumps({"ids": [sample.id, sample2.id]}),
        headers=auth_headers,
    )
    assert res.status_code == 403

    res = await http_client.request(
        method="DELETE",
        url=f"/v2/orgs/{group2.id}/pathogens/{pathogen.slug}/samples/",
        content=json.dumps({"ids": [sample.id, sample2.id]}),
        headers=auth_headers,
    )
    assert res.status_code == 404

    # Test that our multi-delete endpoint succeeds if we only specify an owned sample
    res = await http_client.request(
        method="DELETE",
        url=f"/v2/orgs/{group2.id}/pathogens/{pathogen.slug}/samples/",
        content=json.dumps({"ids": [sample2.id]}),
        headers=auth_headers,
    )
    assert res.status_code == 200


async def make_test_samples(
    async_session: AsyncSession, pathogen: Pathogen, suffix=None
) -> Tuple[User, Group, List[Sample], Location]:
    group = group_factory(name=f"testgroup{suffix}")
    user = await userrole_factory(
        async_session,
        group,
        email=f"testemail{suffix}",
        auth0_user_id=f"testemail{suffix}",
    )
    location1 = location_factory(
        "North America", "USA", "California", f"Santa Barbara County{suffix}"
    )
    location2 = location_factory(
        "North America", "USA", "California", f"Santa Clara County{suffix}"
    )
    samples = [
        sample_factory(
            group,
            user,
            location1,
            pathogen=pathogen,
            public_identifier="path/to/sample_id1",
            private_identifier="i_dont_have_spaces1",
        ),
        sample_factory(
            group,
            user,
            location1,
            pathogen=pathogen,
            public_identifier="path/to/sample id2",
            private_identifier="i have spaces2",
        ),
        sample_factory(
            group,
            user,
            location1,
            pathogen=pathogen,
            public_identifier="path/to/sample_id3",
            private_identifier="i have spaces3",
        ),
    ]
    for sample in samples:
        upg = uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
        async_session.add(upg)
    async_session.add(group)
    async_session.add(location2)
    await async_session.commit()
    return user, group, samples, location2


async def test_update_samples_success(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test successful sample update
    """
    pathogen: Pathogen = random_pathogen_factory()
    user, group, samples, newlocation = await make_test_samples(async_session, pathogen)

    auth_headers = {"user_id": user.auth0_user_id}

    request_data = {
        "samples": [
            {
                "id": samples[0].id,
                "private_identifier": "new_private_identifier",
                "public_identifier": "new_public_identifier1",
                "private": True,
                "collection_location": newlocation.id,
                "sequencing_date": "2021-10-10",
                "collection_date": "2021-11-11",
            },
            {
                "id": samples[1].id,
                "public_identifier": "new_public_identifier2",
                "private_identifier": "new_private_identifier2",
                "private": False,
                "collection_location": newlocation.id,
                "sequencing_date": "2021-10-10",
                "collection_date": "2021-11-11",
            },
            {
                "id": samples[2].id,
                "public_identifier": None,
                "private_identifier": "new_public_identifier3",
                "collection_location": newlocation.id,
                "private": True,
                "sequencing_date": None,
                "collection_date": "2021-11-11",
            },
        ]
    }
    keys_to_check = [
        "private_identifier",
        "public_identifier",
        "collection_location",
        "collection_date",
        "sequencing_date",
        "private",
    ]
    reorganized_data = {}
    # Make a copy of the original sample data
    for sample in samples:
        sample_dict = {
            key: getattr(sample, key)
            for key in keys_to_check
            if key not in ["sequencing_date"]
        }
        if sample.uploaded_pathogen_genome:
            sample_dict[
                "sequencing_date"
            ] = sample.uploaded_pathogen_genome.sequencing_date
        sample_dict["collection_location"] = sample.collection_location.id
        reorganized_data[sample.id] = sample_dict

    # For any fields that got updated in our API request, update those values.
    for updated in request_data["samples"]:
        reorganized_data[updated["id"]].update(
            {key: updated.get(key) for key in keys_to_check}
        )

    # Tell SqlAlchemy to forget about the samples in its identity map
    # TODO FIXME- we shouldn't have to do this!
    group_id = group.id  # Stash this id so we can use it
    pathogen_slug = pathogen.slug  # Stash this id so we can use it
    async_session.expire_all()

    res = await http_client.put(
        f"/v2/orgs/{group_id}/pathogens/{pathogen_slug}/samples",
        json=request_data,
        headers=auth_headers,
    )
    api_response = {row["id"]: row for row in res.json()["samples"]}

    assert res.status_code == 200

    sample_fields = [
        "collection_date",
        "private",
        "private_identifier",
        "public_identifier",
    ]
    location_fields = ["collection_location"]
    genome_fields = ["sequencing_date"]
    for sample_id, expected in reorganized_data.items():
        # pull sample from the database to verify sample was updated correctly
        q = await async_session.execute(
            sa.select(Sample)  # type: ignore
            .options(
                joinedload(Sample.uploaded_pathogen_genome),
                joinedload(Sample.collection_location),
            )
            .filter(Sample.id == sample_id)
        )
        sample_pulled_from_db = q.scalars().one()

        for field in sample_fields + location_fields + genome_fields:
            api_response_value = api_response[sample_id].get(field)
            request_field_value = expected[field]
            if field == "public_identifier" and request_field_value is None:
                request_field_value = f"hCoV-19/USA/testgroupNone-{sample_id}/2022"
            # Handle location fields
            if field in location_fields:
                db_field_value = getattr(sample_pulled_from_db, field).id
                api_response_value = api_response_value["id"]
            # Handle UploadedPathogenGenome fields
            elif field in genome_fields:
                db_field_value = getattr(
                    sample_pulled_from_db.uploaded_pathogen_genome, field
                )
            else:
                db_field_value = getattr(sample_pulled_from_db, field)
            if "date" in field:
                db_field_value = str(db_field_value) if db_field_value else None
                request_field_value = (
                    str(request_field_value) if request_field_value else None
                )
            # Check that the DB and our API Request match
            # TODO - this isn't handling auto generated values !!!!
            assert db_field_value == request_field_value
            # Check that the DB and our API Response match.
            assert db_field_value == api_response_value


async def test_update_samples_access_denied(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test update failures
    """
    pathogen: Pathogen = random_pathogen_factory()
    user, group, samples, newlocation = await make_test_samples(async_session, pathogen)
    user2, group2, samples2, newlocation2 = await make_test_samples(
        async_session, pathogen, suffix="2"
    )

    auth_headers = {"user_id": user.auth0_user_id}

    data = {
        "samples": [
            {
                "id": samples2[0].id,
                "private_identifier": "new_private_identifier",
                "public_identifier": "new_public_identifier",
                "collection_location": samples2[0].location_id,
                "private": True,
                "sequencing_date": None,
                "collection_date": "2021-11-11",
            }
        ]
    }

    res = await http_client.put(
        f"/v2/orgs/{group.id}/pathogens/{pathogen.slug}/samples",
        json=data,
        headers=auth_headers,
    )
    assert res.status_code == 404


async def test_update_samples_request_failures(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test update failures
    """
    pathogen = random_pathogen_factory()
    user, group, samples, newlocation = await make_test_samples(async_session, pathogen)

    auth_headers = {"user_id": user.auth0_user_id}

    bad_requests = [
        [
            {
                "id": samples[0].id,
                "collection_location": 9999,  # Use a location id that doesn't exist
                "private_identifier": "new_private_identifier",
                "public_identifier": "new_public_identifier",
                "private": True,
                "sequencing_date": None,
                "collection_date": "2021-11-11",
            },
            400,
        ],
        [
            {
                "id": samples[0].id,
                "sequencing_date": "kapow",  # date deserialization failure
                "private_identifier": "new_private_identifier_1",
                "public_identifier": "new_public_identifier_1",
                "private": True,
                "collection_date": "2021-11-11",
                "collection_location": samples[0].location_id,
            },
            422,
        ],
        [
            {
                "id": samples[0].id,
                "private": True,
                "private_identifier": "new_private_identifier_2",
                "public_identifier": "",  # empty strings not allowed
                "sequencing_date": None,
                "collection_date": "2021-11-11",
                "collection_location": samples[0].location_id,
            },
            422,
        ],
        [
            {
                "id": samples[0].id,
                "private": "something",  # Bad boolean
                "private_identifier": "new_private_identifier_3",
                "public_identifier": "new_public_identifier_3",
                "sequencing_date": None,
                "collection_date": "2021-11-11",
                "collection_location": samples[0].location_id,
            },
            422,
        ],
        [
            {
                "id": samples[0].id,
                "public_identifier": samples[
                    1
                ].public_identifier,  # Trigger duplicate identifier error
                "private_identifier": "new_private_identifier_4",
                "private": True,
                "sequencing_date": None,
                "collection_date": "2021-11-11",
                "collection_location": samples[0].location_id,
            },
            400,
        ],
        [
            {
                "id": samples[0].id,
                "private_identifier": samples[
                    1
                ].private_identifier,  # Trigger duplicate identifier error
                "public_identifier": "new_public_identifier_5",
                "private": True,
                "sequencing_date": None,
                "collection_date": "2021-11-11",
                "collection_location": samples[0].location_id,
            },
            400,
        ],
    ]
    for request, response_code in bad_requests:
        data = {"samples": [request]}

        res = await http_client.put(
            f"/v2/orgs/{group.id}/pathogens/{pathogen.slug}/samples",
            json=data,
            headers=auth_headers,
        )
        assert res.status_code == response_code


async def setup_validation_data(async_session: AsyncSession, split_client: SplitClient):
    group = group_factory()
    pathogen = random_pathogen_factory()
    repo = random_default_repo_factory(split_client)
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    sample = sample_factory(group, user, location, pathogen=pathogen)
    strain_sample = repo_metadata_factory(pathogen, repo)
    isl_sample = repo_metadata_factory(
        pathogen, repo, strain="USA/ISL-TEST/hCov-19", isl="EPI_ISL_3141592"
    )
    async_session.add_all([group, pathogen, sample, strain_sample, isl_sample])
    await async_session.commit()

    return user, group, pathogen, repo, sample, strain_sample, isl_sample


async def test_validation_endpoint(
    async_session: AsyncSession, http_client: AsyncClient, split_client: SplitClient
):
    """
    Test that validation endpoint is correctly identifying identifiers that are in the DB, and that samples are properly stripped of hCoV-19/ prefix
    """

    (
        user,
        group,
        pathogen,
        repo,
        sample,
        gisaid_sample,
        isl_sample,
    ) = await setup_validation_data(async_session, split_client)

    # add hCoV-19/ as prefix to gisaid identifier to check that stripping of prefix is being done correctly
    data = {
        "sample_ids": [
            sample.public_identifier,
            f"hCoV-19/{gisaid_sample.strain}",
            isl_sample.isl,
        ],
    }
    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.post(
        f"/v2/orgs/{group.id}/pathogens/{pathogen.slug}/samples/validate_ids/",
        json=data,
        headers=auth_headers,
    )

    assert res.status_code == 200
    response = res.json()
    assert response["missing_sample_ids"] == []


async def test_validation_endpoint_missing_identifier(
    async_session: AsyncSession, http_client: AsyncClient, split_client: SplitClient
):
    """
    Test that validation endpoint is correctly identifying identifiers that are not aspen public or private ids or gisaid ids
    """

    (
        user,
        group,
        pathogen,
        repo,
        sample,
        gisaid_sample,
        isl_sample,
    ) = await setup_validation_data(async_session, split_client)
    data = {
        "sample_ids": [
            sample.public_identifier,
            gisaid_sample.strain,
            isl_sample.isl,
            "this_is_missing",
        ],
    }
    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.post(
        f"/v2/orgs/{group.id}/pathogens/{pathogen.slug}/samples/validate_ids/",
        json=data,
        headers=auth_headers,
    )

    # request should not fail, should return list of samples that are missing from the DB
    assert res.status_code == 200
    response = res.json()
    assert response["missing_sample_ids"] == ["this_is_missing"]
