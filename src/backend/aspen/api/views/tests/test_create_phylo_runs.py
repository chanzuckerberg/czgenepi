from typing import Any, Dict, List

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.pathogen_repo_config import setup_random_repo_configs
from aspen.test_infra.models.repo_metadata import repo_metadata_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_factory
from aspen.test_infra.models.usergroup import group_factory, userrole_factory
from aspen.test_infra.models.workflow import aligned_repo_data_factory
from aspen.util.split import SplitClient

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


async def test_create_phylo_run(
    async_session: AsyncSession,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    """
    Test phylo tree creation, local-only samples.
    """
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    pathogen, repo_config = setup_random_repo_configs(
        async_session, split_client=split_client
    )
    sample = sample_factory(group, user, location, pathogen=pathogen)
    repo = repo_config.public_repository
    repo_data = aligned_repo_data_factory(pathogen, repo)
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    async_session.add(group)
    async_session.add(repo_data)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    data = {
        "name": "test phylorun",
        "tree_type": "targeted",
        "samples": [sample.public_identifier],
    }
    res = await http_client.post(
        f"/v2/orgs/{group.id}/pathogens/{pathogen.slug}/phylo_runs/",
        json=data,
        headers=auth_headers,
    )
    assert res.status_code == 200
    response = res.json()
    assert response["template_args"] == {}
    assert response["workflow_status"] == "STARTED"
    assert response["group"]["name"] == group.name
    assert response["user"]["name"] == user.name
    assert response["user"]["id"] == user.id
    assert response["pathogen"]["slug"] == pathogen.slug
    assert "id" in response


async def test_create_phylo_run_with_invalid_args(
    async_session: AsyncSession,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    """
    Test phylo tree creation that includes a reference to a public repository sequence.
    """
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    pathogen, repo_config = setup_random_repo_configs(
        async_session, split_client=split_client
    )
    sample = sample_factory(group, user, location, pathogen=pathogen)
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    repo = repo_config.public_repository
    repo_data = aligned_repo_data_factory(pathogen, repo)
    repo_sample = repo_metadata_factory(pathogen, repo)
    async_session.add(group)
    async_session.add(repo_data)
    async_session.add(repo_sample)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    requests = [
        {
            "filter_start_date": "bob",
        },
        {
            "filter_end_date": "01-01-01",
        },
        {
            "filter_pango_lineages": "B.1",
        },
        {
            "filter_pango_lineages": ["FOO_BAR"],
        },
    ]
    request_body = {
        "name": "test phylorun",
        "tree_type": "overview",
        "samples": [sample.public_identifier, repo_sample.strain],
        "template_args": {},
    }
    for args in requests:
        request_body["template_args"] = args  # type: ignore
        res = await http_client.post(
            f"/v2/orgs/{group.id}/pathogens/{pathogen.slug}/phylo_runs/",
            json=request_body,
            headers=auth_headers,
        )
        assert res.status_code == 422


async def test_create_phylo_run_with_template_args(
    async_session: AsyncSession,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    """
    Test phylo tree creation that includes a reference to a public repository sequence.
    """
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    pathogen, repo_config = setup_random_repo_configs(
        async_session, split_client=split_client
    )
    sample = sample_factory(group, user, location, pathogen=pathogen)
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    repo = repo_config.public_repository
    repo_data = aligned_repo_data_factory(pathogen, repo)
    repo_sample = repo_metadata_factory(pathogen, repo)
    async_session.add(group)
    async_session.add(repo_data)
    async_session.add(repo_sample)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    requests: List[Dict[str, Any]] = [
        {
            "name": "test phylorun",
            "tree_type": "overview",
            "samples": [sample.public_identifier, repo_sample.strain],
            "template_args": {
                "filter_start_date": "2021-01-20",
                "filter_end_date": "2022-01-20",
                "filter_pango_lineages": ["A", "B.1.166"],
            },
        },
        {
            "name": "test phylorun",
            "tree_type": "overview",
            "samples": [sample.public_identifier, repo_sample.strain],
            "template_args": {
                "filter_start_date": "2021-01-20",
            },
        },
        {
            "name": "test phylorun",
            "tree_type": "overview",
            "samples": [sample.public_identifier, repo_sample.strain],
            "template_args": {
                "filter_pango_lineages": ["FOO.BAR"],
            },
        },
    ]
    for data in requests:
        res = await http_client.post(
            f"/v2/orgs/{group.id}/pathogens/{pathogen.slug}/phylo_runs/",
            json=data,
            headers=auth_headers,
        )
        assert res.status_code == 200
        response: Dict[str, Any] = res.json()
        for key in data["template_args"]:
            assert key in response["template_args"]
            if key == "filter_pango_lineages":
                assert set(response["template_args"][key]) == set(
                    data["template_args"][key]
                )
            else:
                assert response["template_args"][key] == data["template_args"][key]
        assert response["workflow_status"] == "STARTED"
        assert response["group"]["name"] == group.name
        assert "id" in response


async def test_create_phylo_run_with_strain_ids(
    async_session: AsyncSession,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    """
    Test phylo tree creation that includes a reference to a public repository sequence.
    """
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    pathogen, repo_config = setup_random_repo_configs(
        async_session, split_client=split_client
    )
    sample = sample_factory(group, user, location, pathogen=pathogen)
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    repo = repo_config.public_repository
    repo_data = aligned_repo_data_factory(pathogen, repo)
    repo_sample = repo_metadata_factory(pathogen, repo)
    async_session.add(group)
    async_session.add(repo_data)
    async_session.add(repo_sample)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    data = {
        "name": "test phylorun",
        "tree_type": "non_contextualized",
        "samples": [sample.public_identifier, repo_sample.strain],
    }
    res = await http_client.post(
        f"/v2/orgs/{group.id}/pathogens/{pathogen.slug}/phylo_runs/",
        json=data,
        headers=auth_headers,
    )
    assert res.status_code == 200
    response = res.json()
    assert response["template_args"] == {}
    assert response["workflow_status"] == "STARTED"
    assert response["group"]["name"] == group.name
    assert "id" in response


async def test_create_phylo_run_with_epi_isls(
    async_session: AsyncSession,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    """
    Test phylo tree creation that includes a reference to a public repository sequence.
    """
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    pathogen, repo_config = setup_random_repo_configs(
        async_session, split_client=split_client
    )
    sample = sample_factory(group, user, location, pathogen=pathogen)
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    repo = repo_config.public_repository
    repo_data = aligned_repo_data_factory(pathogen, repo)
    isl_sample = repo_metadata_factory(pathogen, repo)
    async_session.add(group)
    async_session.add(repo_data)
    async_session.add(isl_sample)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    data = {
        "name": "test phylorun",
        "tree_type": "non_contextualized",
        "samples": [sample.public_identifier, isl_sample.isl],
    }
    res = await http_client.post(
        f"/v2/orgs/{group.id}/pathogens/{pathogen.slug}/phylo_runs/",
        json=data,
        headers=auth_headers,
    )
    assert res.status_code == 200
    response = res.json()
    assert response["template_args"] == {}
    assert response["workflow_status"] == "STARTED"
    assert response["group"]["name"] == group.name
    assert "id" in response


async def test_create_invalid_phylo_run_name(
    async_session: AsyncSession,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    """
    Test a phylo tree run request with a bad tree name.
    """
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    pathogen, repo_config = setup_random_repo_configs(
        async_session, split_client=split_client
    )
    sample = sample_factory(group, user, location, pathogen=pathogen)
    repo = repo_config.public_repository
    repo_data = aligned_repo_data_factory(pathogen, repo)
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    async_session.add(group)
    async_session.add(repo_data)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    data = {
        "name": 3.1415926535,
        "tree_type": "targeted",
        "samples": [sample.public_identifier],
    }
    res = await http_client.post(
        f"/v2/orgs/{group.id}/pathogens/{pathogen.slug}/phylo_runs/",
        json=data,
        headers=auth_headers,
    )
    assert res.status_code == 422


async def test_create_invalid_phylo_run_tree_type(
    async_session: AsyncSession,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    """
    Test a phylo tree run request with a bad tree type.
    """
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    pathogen, repo_config = setup_random_repo_configs(
        async_session, split_client=split_client
    )
    sample = sample_factory(group, user, location, pathogen=pathogen)
    repo = repo_config.public_repository
    repo_data = aligned_repo_data_factory(pathogen, repo)
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    async_session.add(group)
    async_session.add(repo_data)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    data = {
        "name": "test phylorun",
        "tree_type": "global",
        "samples": [sample.public_identifier],
    }
    res = await http_client.post(
        f"/v2/orgs/{group.id}/pathogens/{pathogen.slug}/phylo_runs/",
        json=data,
        headers=auth_headers,
    )
    assert res.status_code == 422


async def test_create_invalid_phylo_run_bad_sample_id(
    async_session: AsyncSession,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    """
    Test a phylo tree run request with a bad sample id.
    """
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    pathogen, repo_config = setup_random_repo_configs(
        async_session, split_client=split_client
    )
    sample = sample_factory(group, user, location, pathogen=pathogen)
    repo = repo_config.public_repository
    repo_data = aligned_repo_data_factory(pathogen, repo)
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    async_session.add(group)
    async_session.add(repo_data)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    data = {
        "name": "test phylorun",
        "tree_type": "non_contextualized",
        "samples": [sample.public_identifier, "bad_sample_identifier"],
    }
    res = await http_client.post(
        f"/v2/orgs/{group.id}/pathogens/{pathogen.slug}/phylo_runs/",
        json=data,
        headers=auth_headers,
    )
    assert res.status_code == 400


async def test_create_invalid_phylo_run_sample_cannot_see(
    async_session: AsyncSession,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    """
    Test a phylo tree run request with a sample a group should not have access to.
    """
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    pathogen, repo_config = setup_random_repo_configs(
        async_session, split_client=split_client
    )
    sample = sample_factory(group, user, location, pathogen=pathogen)

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
        group2,
        user2,
        location2,
        public_identifier="USA/OTHER/123456",
        pathogen=pathogen,
    )

    repo = repo_config.public_repository
    aligned_repo_data = aligned_repo_data_factory(pathogen, repo)
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    async_session.add(group)
    async_session.add(group2)
    async_session.add(aligned_repo_data)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    data = {
        "name": "test phylorun",
        "tree_type": "non_contextualized",
        "samples": [sample.public_identifier, sample2.public_identifier],
    }
    res = await http_client.post(
        f"/v2/orgs/{group.id}/pathogens/{pathogen.slug}/phylo_runs/",
        json=data,
        headers=auth_headers,
    )
    assert res.status_code == 400


async def test_create_phylo_run_unauthorized(
    async_session: AsyncSession,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    """
    Make sure a user can't create runs in a group they don't have access to.
    """
    group = group_factory()
    user_group = group_factory(name="User's group")
    user = await userrole_factory(async_session, user_group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    pathogen, repo_config = setup_random_repo_configs(
        async_session, split_client=split_client
    )
    sample = sample_factory(group, user, location, pathogen=pathogen)
    repo = repo_config.public_repository
    repo_data = aligned_repo_data_factory(pathogen, repo)
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    async_session.add(group)
    async_session.add(user_group)
    async_session.add(repo_data)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    data = {
        "name": "test phylorun",
        "tree_type": "targeted",
        "samples": [sample.public_identifier],
    }
    res = await http_client.post(
        f"/v2/orgs/{group.id}/pathogens/{pathogen.slug}/phylo_runs/",
        json=data,
        headers=auth_headers,
    )
    assert res.status_code == 403
