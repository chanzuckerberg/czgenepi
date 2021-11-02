import pytest
import sqlalchemy as sa
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.exc import NoResultFound

from aspen.database.models import Sample
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_factory
from aspen.test_infra.models.usergroup import group_factory, user_factory

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


async def test_delete_sample_success(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test successful sample deletion by public & private ID
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
            f"/v2/samples/{sample.submitting_group_id}/{sample.public_identifier}",
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
        f"/v2/samples/{sample.submitting_group_id}/{sample.public_identifier}",
        headers=auth_headers,
    )
    assert res.status_code == 404
    # Make sure our sample is still in the db.
    res = await async_session.execute(sa.select(Sample).filter(Sample.id == sample.id))  # type: ignore
    found_sample = res.scalars().one()  # type: ignore
    assert found_sample.id == sample.id
