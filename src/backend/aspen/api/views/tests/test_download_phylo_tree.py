import json
from copy import deepcopy
from typing import Dict

import boto3
import pytest
from botocore.client import ClientError
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.api.views.tests.data.phylo_tree_data import TEST_TREE
from aspen.api.views.tests.test_list_phylo_runs import make_all_test_data
from aspen.api.views.tests.test_update_phylo_run_and_tree import make_shared_test_data
from aspen.api.views.tests.utils.phylo_tree_utils import (
    align_json_with_model,
    create_id_mapped_tree,
)
from aspen.database.models import Group, Location, User
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.usergroup import group_factory, user_factory

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio

ID_MAPPED_TREE: Dict = create_id_mapped_tree(TEST_TREE)


async def test_phylo_tree_can_see(
    async_session: AsyncSession,
    http_client: AsyncClient,
    mock_s3_resource: boto3.resource,
):
    user, group, samples, phylo_run, phylo_tree = await make_shared_test_data(
        async_session
    )

    # Create the bucket if it doesn't exist in localstack.
    try:
        mock_s3_resource.meta.client.head_bucket(Bucket=phylo_tree.s3_bucket)
    except ClientError:
        # The bucket does not exist or you have no access.
        mock_s3_resource.create_bucket(Bucket=phylo_tree.s3_bucket)

    matching_tree_json: Dict = align_json_with_model(deepcopy(TEST_TREE), phylo_tree)
    test_json = json.dumps(matching_tree_json)
    mock_s3_resource.Bucket(phylo_tree.s3_bucket).Object(phylo_tree.s3_key).put(
        Body=test_json
    )
    matching_mapped_json: Dict = create_id_mapped_tree(
        align_json_with_model(deepcopy(TEST_TREE), phylo_tree)
    )

    auth_headers = {"name": user.name, "user_id": user.auth0_user_id}
    result = await http_client.get(
        f"/v2/phylo_trees/{phylo_tree.entity_id}/download", headers=auth_headers
    )
    returned_tree = result.json()
    assert returned_tree["tree"] == matching_mapped_json["tree"]


async def test_phylo_tree_id_style_public(
    async_session: AsyncSession,
    http_client: AsyncClient,
    mock_s3_resource: boto3.resource,
):
    user, group, samples, phylo_run, phylo_tree = await make_shared_test_data(
        async_session
    )

    # Create the bucket if it doesn't exist in localstack.
    try:
        mock_s3_resource.meta.client.head_bucket(Bucket=phylo_tree.s3_bucket)
    except ClientError:
        # The bucket does not exist or you have no access.
        mock_s3_resource.create_bucket(Bucket=phylo_tree.s3_bucket)

    test_json = json.dumps(TEST_TREE)
    mock_s3_resource.Bucket(phylo_tree.s3_bucket).Object(phylo_tree.s3_key).put(
        Body=test_json
    )

    auth_headers = {"name": user.name, "user_id": user.auth0_user_id}
    result = await http_client.get(
        f"/v2/phylo_trees/{phylo_tree.entity_id}/download?id_style=public",
        headers=auth_headers,
    )
    returned_tree = result.json()
    assert returned_tree["tree"] == TEST_TREE["tree"]


async def test_phylo_tree_no_can_see(
    async_session: AsyncSession,
    http_client: AsyncClient,
    mock_s3_resource: boto3.resource,
    n_trees=1,
    n_samples=5,
):
    owner_group: Group = group_factory()
    viewer_group: Group = group_factory(name="CADPH")
    user: User = user_factory(viewer_group)
    location: Location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )

    _, _, trees, runs = make_all_test_data(
        owner_group, user, location, n_samples, n_trees
    )

    phylo_tree = trees[0]  # we only have one
    phylo_run = runs[0]
    async_session.add_all((owner_group, viewer_group, user, phylo_run, phylo_tree))
    await async_session.commit()

    # Create the bucket if it doesn't exist in localstack.
    try:
        mock_s3_resource.meta.client.head_bucket(Bucket=phylo_tree.s3_bucket)
    except ClientError:
        # The bucket does not exist or you have no access.
        mock_s3_resource.create_bucket(Bucket=phylo_tree.s3_bucket)

    test_json = json.dumps(TEST_TREE)
    mock_s3_resource.Bucket(phylo_tree.s3_bucket).Object(phylo_tree.s3_key).put(
        Body=test_json
    )

    expected_response = {
        "error": f"PhyloTree with id {phylo_tree.id} not viewable by user with id: {user.id}"
    }

    auth_headers = {"name": user.name, "user_id": user.auth0_user_id}
    result = await http_client.get(
        f"/v2/phylo_trees/{phylo_tree.entity_id}/download", headers=auth_headers
    )
    assert result.json() == expected_response


async def test_phylo_tree_admin(
    async_session: AsyncSession,
    http_client: AsyncClient,
    mock_s3_resource: boto3.resource,
    n_trees=1,
    n_samples=5,
):
    owner_group: Group = group_factory()
    viewer_group: Group = group_factory("admin")
    user: User = user_factory(viewer_group, system_admin=True)
    location: Location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    _, _, trees, runs = make_all_test_data(
        owner_group, user, location, n_samples, n_trees
    )

    phylo_tree = trees[0]  # we only have one
    phylo_run = runs[0]
    async_session.add_all((owner_group, viewer_group, user, phylo_run, phylo_tree))
    await async_session.commit()

    # make_all_test_data() randomly selects samples for trees, so we have to make sure we are expecting the right json
    matching_tree_json: Dict = align_json_with_model(deepcopy(TEST_TREE), phylo_tree)

    matching_mapped_json: Dict = create_id_mapped_tree(
        align_json_with_model(deepcopy(TEST_TREE), phylo_tree)
    )

    # Create the bucket if it doesn't exist in localstack.
    try:
        mock_s3_resource.meta.client.head_bucket(Bucket=phylo_tree.s3_bucket)
    except ClientError:
        # The bucket does not exist or you have no access.
        mock_s3_resource.create_bucket(Bucket=phylo_tree.s3_bucket)

    test_json = json.dumps(matching_tree_json)

    mock_s3_resource.Bucket(phylo_tree.s3_bucket).Object(phylo_tree.s3_key).put(
        Body=test_json
    )

    auth_headers = {"name": user.name, "user_id": user.auth0_user_id}
    result = await http_client.get(
        f"/v2/phylo_trees/{phylo_tree.entity_id}/download", headers=auth_headers
    )
    assert result.json()["tree"] == matching_mapped_json["tree"]
