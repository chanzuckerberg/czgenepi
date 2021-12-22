import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.test_infra.models.gisaid_metadata import gisaid_metadata_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_factory
from aspen.test_infra.models.usergroup import group_factory, user_factory
from aspen.test_infra.models.workflow import aligned_gisaid_dump_factory

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


async def test_create_phylo_run(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test phylo tree creation, local-only samples.
    """
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    gisaid_dump = aligned_gisaid_dump_factory()
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    async_session.add(group)
    async_session.add(gisaid_dump)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    data = {
        "name": "test phylorun",
        "tree_type": "targeted",
        "samples": [sample.public_identifier],
    }
    res = await http_client.post("/v2/phylo_runs/", json=data, headers=auth_headers)
    assert res.status_code == 200
    response = res.json()
    assert response["template_args"] == {}
    assert response["workflow_status"] == "STARTED"
    assert response["group"]["name"] == group.name
    assert response["user"]["name"] == user.name
    assert response["user"]["id"] == user.id
    assert "id" in response


async def test_create_phylo_run_with_failed_sample(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test phylo tree creation, with a sample that failed genome recovery
    """
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    sample.czb_failed_genome_recovery = True
    gisaid_dump = aligned_gisaid_dump_factory()
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    async_session.add(group)
    async_session.add(gisaid_dump)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    data = {
        "name": "test phylorun",
        "tree_type": "targeted",
        "samples": [sample.public_identifier],
    }
    res = await http_client.post("/v2/phylo_runs/", json=data, headers=auth_headers)
    assert res.status_code == 400


async def test_create_phylo_run_with_gisaid_ids(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test phylo tree creation that includes a reference to a GISAID sequence.
    """
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    gisaid_dump = aligned_gisaid_dump_factory()
    gisaid_sample = gisaid_metadata_factory()
    async_session.add(group)
    async_session.add(gisaid_dump)
    async_session.add(gisaid_sample)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    data = {
        "name": "test phylorun",
        "tree_type": "non_contextualized",
        "samples": [sample.public_identifier, gisaid_sample.strain],
    }
    res = await http_client.post("/v2/phylo_runs/", json=data, headers=auth_headers)
    assert res.status_code == 200
    response = res.json()
    assert response["template_args"] == {}
    assert response["workflow_status"] == "STARTED"
    assert response["group"]["name"] == group.name
    assert "id" in response


async def test_create_invalid_phylo_run_name(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test a phylo tree run request with a bad tree name.
    """
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    gisaid_dump = aligned_gisaid_dump_factory()
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    async_session.add(group)
    async_session.add(gisaid_dump)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    data = {
        "name": 3.1415926535,
        "tree_type": "targeted",
        "samples": [sample.public_identifier],
    }
    res = await http_client.post("/v2/phylo_runs/", json=data, headers=auth_headers)
    assert res.status_code == 422


async def test_create_invalid_phylo_run_tree_type(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test a phylo tree run request with a bad tree type.
    """
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    gisaid_dump = aligned_gisaid_dump_factory()
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    async_session.add(group)
    async_session.add(gisaid_dump)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    data = {
        "name": "test phylorun",
        "tree_type": "global",
        "samples": [sample.public_identifier],
    }
    res = await http_client.post("/v2/phylo_runs/", json=data, headers=auth_headers)
    assert res.status_code == 422


async def test_create_invalid_phylo_run_bad_sample_id(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test a phylo tree run request with a bad sample id.
    """
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    gisaid_dump = aligned_gisaid_dump_factory()
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    async_session.add(group)
    async_session.add(gisaid_dump)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    data = {
        "name": "test phylorun",
        "tree_type": "non_contextualized",
        "samples": [sample.public_identifier, "bad_sample_identifier"],
    }
    res = await http_client.post("/v2/phylo_runs/", json=data, headers=auth_headers)
    assert res.status_code == 400


async def test_create_invalid_phylo_run_sample_cannot_see(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test a phylo tree run request with a sample a group should not have access to.
    """
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)

    group2 = group_factory(name="The Other Group")
    user2 = user_factory(
        group2, email="test_user@othergroup.org", auth0_user_id="other_test_auth0_id"
    )
    sample2 = sample_factory(group2, user2, public_identifier="USA/OTHER/123456")

    gisaid_dump = aligned_gisaid_dump_factory()
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    async_session.add(group)
    async_session.add(group2)
    async_session.add(gisaid_dump)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    data = {
        "name": "test phylorun",
        "tree_type": "non_contextualized",
        "samples": [sample.public_identifier, sample2.public_identifier],
    }
    res = await http_client.post("/v2/phylo_runs/", json=data, headers=auth_headers)
    assert res.status_code == 400


async def test_create_phylo_run_unauthorized_access_redirect(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test a request from an outside, unauthorized source.
    """
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)

    gisaid_dump = aligned_gisaid_dump_factory()
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    async_session.add(group)
    async_session.add(gisaid_dump)
    await async_session.commit()

    data = {
        "name": "test phylorun",
        "tree_type": "non_contextualized",
        "samples": [sample.public_identifier],
    }
    res = await http_client.post("/v2/phylo_runs/", json=data)
    assert res.status_code == 401
