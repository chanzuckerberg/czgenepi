import datetime
from typing import Any, Optional, Sequence, Tuple

import pytest
import sqlalchemy as sa
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.exc import NoResultFound

from aspen.api.utils import format_date
from aspen.database.models import (
    CanSee,
    DataType,
    PublicRepositoryType,
    Sample,
    SequencingReadsCollection,
)
from aspen.test_infra.models.accession_workflow import AccessionWorkflowDirective
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_factory
from aspen.test_infra.models.usergroup import group_factory, user_factory

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


# test LIST samples #


async def test_samples_view(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user, private=True)
    uploaded_pathogen_genome = uploaded_pathogen_genome_factory(sample)
    async_session.add(group)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.get(
        "/v2/samples/",
        headers=auth_headers,
    )
    response = res.json()
    expected = {
        "samples": [
            {
                "collection_date": format_date(sample.collection_date),
                "collection_location": sample.location,
                "czb_failed_genome_recovery": False,
                "gisaid": {
                    "status": "Accepted",
                    "gisaid_id": uploaded_pathogen_genome.accessions()[
                        0
                    ].public_identifier,
                },
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": format_date(uploaded_pathogen_genome.upload_date),
                "sequencing_date": format_date(
                    uploaded_pathogen_genome.sequencing_date
                ),
                "lineage": {
                    "lineage": uploaded_pathogen_genome.pangolin_lineage,
                    "probability": uploaded_pathogen_genome.pangolin_probability,
                    "version": uploaded_pathogen_genome.pangolin_version,
                    "last_updated": format_date(
                        uploaded_pathogen_genome.pangolin_last_updated
                    ),
                },
                "private": True,
                "submitting_group": {
                    "id": group.id,
                    "name": group.name,
                },
                "uploaded_by": {"id": user.id, "name": user.name},
            }
        ]
    }
    assert response == expected


async def test_samples_view_gisaid_rejected(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    # Test no GISAID accession logic
    uploaded_pathogen_genome = uploaded_pathogen_genome_factory(
        sample,
        accessions=(
            AccessionWorkflowDirective(
                PublicRepositoryType.GISAID,
                datetime.datetime.now() - datetime.timedelta(days=5),
                None,
                None,
            ),
        ),
    )
    async_session.add(group)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.get(
        "/v2/samples/",
        headers=auth_headers,
    )
    response = res.json()
    expected = {
        "samples": [
            {
                "collection_date": format_date(sample.collection_date),
                "collection_location": sample.location,
                "czb_failed_genome_recovery": False,
                "gisaid": {"status": "Rejected", "gisaid_id": None},
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": format_date(uploaded_pathogen_genome.upload_date),
                "sequencing_date": format_date(
                    uploaded_pathogen_genome.sequencing_date
                ),
                "lineage": {
                    "lineage": uploaded_pathogen_genome.pangolin_lineage,
                    "probability": uploaded_pathogen_genome.pangolin_probability,
                    "version": uploaded_pathogen_genome.pangolin_version,
                    "last_updated": format_date(
                        uploaded_pathogen_genome.pangolin_last_updated
                    ),
                },
                "private": False,
                "submitting_group": {
                    "id": group.id,
                    "name": group.name,
                },
                "uploaded_by": {"id": user.id, "name": user.name},
            }
        ]
    }
    assert response == expected


async def test_samples_view_gisaid_no_info(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    # Test no GISAID accession logic
    uploaded_pathogen_genome = uploaded_pathogen_genome_factory(
        sample,
        accessions=(),
    )

    async_session.add(group)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.get(
        "/v2/samples/",
        headers=auth_headers,
    )
    response = res.json()

    expected = {
        "samples": [
            {
                "collection_date": format_date(sample.collection_date),
                "collection_location": sample.location,
                "czb_failed_genome_recovery": False,
                "gisaid": {"status": "Not Yet Submitted", "gisaid_id": None},
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": format_date(uploaded_pathogen_genome.upload_date),
                "sequencing_date": format_date(
                    uploaded_pathogen_genome.sequencing_date
                ),
                "lineage": {
                    "lineage": uploaded_pathogen_genome.pangolin_lineage,
                    "probability": uploaded_pathogen_genome.pangolin_probability,
                    "version": uploaded_pathogen_genome.pangolin_version,
                    "last_updated": format_date(
                        uploaded_pathogen_genome.pangolin_last_updated
                    ),
                },
                "private": False,
                "submitting_group": {
                    "id": group.id,
                    "name": group.name,
                },
                "uploaded_by": {"id": user.id, "name": user.name},
            }
        ]
    }
    assert response == expected


async def test_samples_view_gisaid_not_eligible(
    async_session: AsyncSession, http_client: AsyncClient
):
    group = group_factory()
    user = user_factory(group)
    # Mark the sample as failed
    sample = sample_factory(group, user, czb_failed_genome_recovery=True)
    async_session.add(group)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.get(
        "/v2/samples/",
        headers=auth_headers,
    )
    response = res.json()
    expected = {
        "samples": [
            {
                "collection_date": format_date(sample.collection_date),
                "collection_location": sample.location,
                "czb_failed_genome_recovery": True,
                "gisaid": {"status": "Not Eligible", "gisaid_id": None},
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": format_date(None),
                # In some cases, `sequencing_date` could actually still exist with a
                # failed genome recovery, but for this test it's None because the sample
                # has no underlying sequenced entity (no uploaded_pathogen_genome).
                "sequencing_date": format_date(None),
                "lineage": {
                    "lineage": None,
                    "probability": None,
                    "version": None,
                    "last_updated": None,
                },
                "private": False,
                "submitting_group": {
                    "id": group.id,
                    "name": group.name,
                },
                "uploaded_by": {"id": user.id, "name": user.name},
            }
        ]
    }
    assert response == expected


async def test_samples_view_gisaid_submitted(
    async_session: AsyncSession, http_client: AsyncClient
):
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    # create a sample with a gisaid workflow but no accession yet
    uploaded_pathogen_genome = uploaded_pathogen_genome_factory(
        sample,
        accessions=(
            AccessionWorkflowDirective(
                PublicRepositoryType.GISAID,
                datetime.datetime.now(),
                None,
                None,
            ),
        ),
    )
    async_session.add(group)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.get(
        "/v2/samples/",
        headers=auth_headers,
    )
    response = res.json()
    expected = {
        "samples": [
            {
                "collection_date": format_date(sample.collection_date),
                "collection_location": sample.location,
                "czb_failed_genome_recovery": False,
                "gisaid": {"status": "Submitted", "gisaid_id": None},
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": format_date(uploaded_pathogen_genome.upload_date),
                "sequencing_date": format_date(
                    uploaded_pathogen_genome.sequencing_date
                ),
                "lineage": {
                    "lineage": uploaded_pathogen_genome.pangolin_lineage,
                    "probability": uploaded_pathogen_genome.pangolin_probability,
                    "version": uploaded_pathogen_genome.pangolin_version,
                    "last_updated": format_date(
                        uploaded_pathogen_genome.pangolin_last_updated
                    ),
                },
                "private": False,
                "submitting_group": {
                    "id": group.id,
                    "name": group.name,
                },
                "uploaded_by": {"id": user.id, "name": user.name},
            }
        ]
    }
    assert response == expected


# Helper function for cansee tests
async def _test_samples_view_cansee(
    async_session: AsyncSession,
    http_client: AsyncClient,
    cansee_datatypes: Sequence[DataType],
    user_factory_kwargs: Optional[dict] = None,
) -> Tuple[Sample, SequencingReadsCollection, Any]:
    user_factory_kwargs = user_factory_kwargs or {}
    owner_group = group_factory()
    viewer_group = group_factory(name="cdph")
    user = user_factory(viewer_group, **user_factory_kwargs)
    sample = sample_factory(owner_group, user)
    # create a private sample as well to make sure it doesn't get shown unless admin
    private_sample = sample_factory(
        owner_group,
        user,
        private=True,
        private_identifier="private_id",
        public_identifier="public_id_2",
    )
    uploaded_pathogen_genome_factory(
        private_sample,
        accessions=(
            AccessionWorkflowDirective(
                PublicRepositoryType.GISAID,
                datetime.datetime.now(),
                None,
                None,
            ),
        ),
    )

    uploaded_pathogen_genome = uploaded_pathogen_genome_factory(sample)
    for cansee_datatype in cansee_datatypes:
        CanSee(
            viewer_group=viewer_group,
            owner_group=owner_group,
            data_type=cansee_datatype,
        )
    async_session.add_all((owner_group, viewer_group))
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.get(
        "/v2/samples/",
        headers=auth_headers,
    )
    response = res.json()

    return (
        sample,
        uploaded_pathogen_genome,
        response,
    )


async def test_samples_view_no_cansee(
    async_session: AsyncSession, http_client: AsyncClient
):
    _, _, response = await _test_samples_view_cansee(
        async_session,
        http_client,
        cansee_datatypes=(),
    )
    assert response["samples"] == []


async def test_samples_view_system_admin(
    async_session: AsyncSession,
    http_client: AsyncClient,
):

    sample, uploaded_pathogen_genome, response = await _test_samples_view_cansee(
        async_session,
        http_client,
        cansee_datatypes=(),
        user_factory_kwargs={
            "system_admin": True,
        },
    )
    # assert that we get both the public and private samples back
    samples = response["samples"]
    assert len(samples) == 2
    private_ids = {sample["private_identifier"] for sample in samples}
    private = {sample["private"] for sample in samples}
    assert private_ids == {"private_identifer", "private_id"}
    assert private == {True, False}


async def test_samples_view_cansee_trees(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    _, _, response = await _test_samples_view_cansee(
        async_session,
        http_client,
        cansee_datatypes=(DataType.TREES,),
    )
    assert response["samples"] == []


# async def test_samples_view_cansee_sequences(
#     async_session: AsyncSession,
#     http_client: AsyncClient,
# ):
#     _, _, response = await _test_samples_view_cansee(
#         async_session,
#         http_client,
#         cansee_datatypes=(DataType.SEQUENCES,),
#     )
#     assert response["samples"] == []


# async def test_samples_view_cansee_metadata(
#     async_session: AsyncSession,
#     http_client: AsyncClient,
# ):
#     sample, uploaded_pathogen_genome, response = await _test_samples_view_cansee(
#         async_session,
#         http_client,
#         cansee_datatypes=(DataType.METADATA,),
#     )

#     # no private identifier in the output.
#     samples = response["samples"]
#     assert len(samples) == 1
#     assert isinstance(samples[0].get("public_identifier", None), str)
#     assert samples[0].get("private_identifier", None) is None


# async def test_samples_view_cansee_private_identifiers(
#     async_session: AsyncSession,
#     http_client: AsyncClient,
# ):
#     """This state really makes no sense because why would you be able to see private
#     identifiers but not metadata??  But we'll ensure it still does the right thing."""
#     _, _, response = await _test_samples_view_cansee(
#         async_session,
#         http_client,
#         cansee_datatypes=(DataType.PRIVATE_IDENTIFIERS,),
#     )

#     # no private identifier in the output.
#     assert response["samples"] == []


async def test_samples_view_cansee_all(
    async_session: AsyncSession,
    http_client: AsyncClient,
):

    sample, uploaded_pathogen_genome, response = await _test_samples_view_cansee(
        async_session,
        http_client,
        cansee_datatypes=(DataType.METADATA, DataType.PRIVATE_IDENTIFIERS),
    )

    # yes private identifier in the output.
    assert response["samples"] == [
        {
            "collection_date": format_date(sample.collection_date),
            "collection_location": sample.location,
            "czb_failed_genome_recovery": False,
            "gisaid": {
                "status": "Accepted",
                "gisaid_id": uploaded_pathogen_genome.accessions()[0].public_identifier,
            },
            "private_identifier": sample.private_identifier,
            "public_identifier": sample.public_identifier,
            "upload_date": format_date(uploaded_pathogen_genome.upload_date),
            "sequencing_date": format_date(uploaded_pathogen_genome.sequencing_date),
            "lineage": {
                "lineage": uploaded_pathogen_genome.pangolin_lineage,
                "probability": uploaded_pathogen_genome.pangolin_probability,
                "version": uploaded_pathogen_genome.pangolin_version,
                "last_updated": format_date(
                    uploaded_pathogen_genome.pangolin_last_updated
                ),
            },
            "private": False,
            "submitting_group": {
                "id": 1,
                "name": "groupname",
            },
            "uploaded_by": {
                "id": 1,
                "name": "test",
            },
        }
    ]


async def test_samples_failed_accession(
    async_session: AsyncSession, http_client: AsyncClient
):
    """Add a sample with one successful and one failed accession attempt.  The samples
    view should return the successful accession ID."""
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    uploaded_pathogen_genome = uploaded_pathogen_genome_factory(
        sample,
        accessions=(
            # failed accession.
            AccessionWorkflowDirective(
                PublicRepositoryType.GISAID,
                datetime.datetime.now() - datetime.timedelta(days=1, hours=2),
                None,
                None,
            ),
            AccessionWorkflowDirective(
                PublicRepositoryType.GISAID,
                datetime.datetime.now() - datetime.timedelta(days=1, hours=1),
                datetime.datetime.now() - datetime.timedelta(days=1),
                "public_identifier_succeeded",
            ),
        ),
    )

    for accession in uploaded_pathogen_genome.accessions():
        print(type(accession))
    async_session.add(group)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.get(
        "/v2/samples/",
        headers=auth_headers,
    )
    response = res.json()
    expected = {
        "samples": [
            {
                "collection_date": format_date(sample.collection_date),
                "collection_location": sample.location,
                "czb_failed_genome_recovery": False,
                "gisaid": {
                    "status": "Accepted",
                    "gisaid_id": "public_identifier_succeeded",
                },
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": format_date(uploaded_pathogen_genome.upload_date),
                "sequencing_date": format_date(
                    uploaded_pathogen_genome.sequencing_date
                ),
                "lineage": {
                    "lineage": uploaded_pathogen_genome.pangolin_lineage,
                    "probability": uploaded_pathogen_genome.pangolin_probability,
                    "version": uploaded_pathogen_genome.pangolin_version,
                    "last_updated": format_date(
                        uploaded_pathogen_genome.pangolin_last_updated
                    ),
                },
                "private": False,
                "submitting_group": {
                    "id": group.id,
                    "name": group.name,
                },
                "uploaded_by": {"id": user.id, "name": user.name},
            }
        ]
    }
    assert response == expected


async def test_samples_multiple_accession(
    async_session: AsyncSession, http_client: AsyncClient
):
    """Add a sample with two successful accession attempts.  The samples view should
    return the latest accession ID."""
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    uploaded_pathogen_genome = uploaded_pathogen_genome_factory(
        sample,
        accessions=(
            # failed accession.
            AccessionWorkflowDirective(
                PublicRepositoryType.GISAID,
                datetime.datetime.now() - datetime.timedelta(days=1, hours=2),
                datetime.datetime.now() - datetime.timedelta(days=1, hours=1),
                "public_identifier_earlier",
            ),
            AccessionWorkflowDirective(
                PublicRepositoryType.GISAID,
                datetime.datetime.now() - datetime.timedelta(days=1, hours=1),
                datetime.datetime.now() - datetime.timedelta(days=1),
                "public_identifier_later",
            ),
        ),
    )
    async_session.add(group)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    res = await http_client.get(
        "/v2/samples/",
        headers=auth_headers,
    )
    response = res.json()
    expected = {
        "samples": [
            {
                "collection_date": format_date(sample.collection_date),
                "collection_location": sample.location,
                "czb_failed_genome_recovery": False,
                "gisaid": {
                    "status": "Accepted",
                    "gisaid_id": "public_identifier_later",
                },
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": format_date(uploaded_pathogen_genome.upload_date),
                "sequencing_date": format_date(
                    uploaded_pathogen_genome.sequencing_date
                ),
                "lineage": {
                    "lineage": uploaded_pathogen_genome.pangolin_lineage,
                    "probability": uploaded_pathogen_genome.pangolin_probability,
                    "version": uploaded_pathogen_genome.pangolin_version,
                    "last_updated": format_date(
                        uploaded_pathogen_genome.pangolin_last_updated
                    ),
                },
                "private": False,
                "submitting_group": {
                    "id": group.id,
                    "name": group.name,
                },
                "uploaded_by": {"id": user.id, "name": user.name},
            }
        ]
    }
    assert response == expected


async def test_samples_view_no_pangolin(
    async_session: AsyncSession, http_client: AsyncClient
):
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
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
        "/v2/samples/",
        headers=auth_headers,
    )
    response = res.json()
    expected = {
        "samples": [
            {
                "collection_date": format_date(sample.collection_date),
                "collection_location": sample.location,
                "czb_failed_genome_recovery": False,
                "gisaid": {
                    "status": "Accepted",
                    "gisaid_id": uploaded_pathogen_genome.accessions()[
                        0
                    ].public_identifier,
                },
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": format_date(uploaded_pathogen_genome.upload_date),
                "sequencing_date": format_date(
                    uploaded_pathogen_genome.sequencing_date
                ),
                "lineage": {
                    "lineage": None,
                    "probability": None,
                    "version": None,
                    "last_updated": None,
                },
                "private": False,
                "submitting_group": {
                    "id": group.id,
                    "name": group.name,
                },
                "uploaded_by": {"id": user.id, "name": user.name},
            }
        ]
    }
    assert response == expected


# test DELETE samples #


async def test_delete_sample_success(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test successful sample deletion by ID
    """
    group = group_factory()
    user = user_factory(group)
    samples = [
        sample_factory(
            group,
            user,
            public_identifier="path/to/sample_id1",
            private_identifier="i_dont_have_spaces1",
        ),
        sample_factory(
            group,
            user,
            public_identifier="path/to/sample id2",
            private_identifier="i have spaces2",
        ),
        sample_factory(
            group,
            user,
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
            f"/v2/samples/{sample.id}",
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


async def test_delete_sample_failures(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test a sample deletion failure by a user without write access
    """
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    upg = uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    async_session.add(upg)
    async_session.add(group)

    # A group that doesn't have access to our sample.
    group2 = group_factory(name="The Other Group")
    user2 = user_factory(
        group2, email="test_user@othergroup.org", auth0_user_id="other_test_auth0_id"
    )
    async_session.add(group2)
    await async_session.commit()

    # Request this sample as a user who shouldn't be able to delete it.
    auth_headers = {"user_id": user2.auth0_user_id}
    res = await http_client.delete(
        f"/v2/samples/{sample.id}",
        headers=auth_headers,
    )
    assert res.status_code == 404
    # Make sure our sample is still in the db.
    res = await async_session.execute(sa.select(Sample).filter(Sample.id == sample.id))  # type: ignore
    found_sample = res.scalars().one()  # type: ignore
    assert found_sample.id == sample.id
