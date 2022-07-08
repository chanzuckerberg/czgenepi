import json

import boto3
import pytest
from botocore.client import ClientError
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.phylo_tree import phylorun_factory, phylotree_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.usergroup import (
    group_factory,
    grouprole_factory,
    userrole_factory,
)

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio

TEST_TREE = {
    "meta": {
        "colorings": [],
    },
    "tree": {
        "name": "public_identifier_1",
        "children": [
            {"name": "public_identifier_2"},
            {"name": "public_identifier_3"},
            {
                "name": "public_identifier_4",
                "children": [{"name": "public_identifier_5"}],
            },
        ],
    },
}


async def test_phylo_tree_rename(
    http_client: AsyncClient,
    async_session: AsyncSession,
    mock_s3_resource: boto3.resource,
):
    """Create a set of samples belonging to different groups with different levels of
    can-see relationships.  Rename the nodes according to the can-see rules, and verify
    that the nodes are renamed correctly."""
    viewer_group = group_factory()
    can_see_group = group_factory("can_see")
    wrong_can_see_group = group_factory("wrong_can_see")
    no_can_see_group = group_factory("no_can_see")
    admin_roles = await grouprole_factory(
        async_session, can_see_group, viewer_group, "admin"
    )
    viewer_roles = await grouprole_factory(
        async_session, wrong_can_see_group, viewer_group, "viewer"
    )
    user = await userrole_factory(async_session, viewer_group)
    async_session.add_all(
        admin_roles
        + viewer_roles
        + [viewer_group, can_see_group, wrong_can_see_group, no_can_see_group]
    )

    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )

    local_sample = sample_factory(
        viewer_group,
        user,
        location,
        private_identifier="private_identifier_1",
        public_identifier="public_identifier_1",
    )
    # NOTE - our test user *can see* private identifiers for samples from this group!
    can_see_sample = sample_factory(
        can_see_group,
        user,
        location,
        private_identifier="private_identifier_2",
        public_identifier="public_identifier_2",
    )
    wrong_can_see_sample = sample_factory(
        wrong_can_see_group,
        user,
        location,
        private_identifier="private_identifer_3",
        public_identifier="public_identifier_3",
    )
    no_can_see_sample = sample_factory(
        no_can_see_group,
        user,
        location,
        private_identifier="private_identifer_4",
        public_identifier="public_identifier_4",
    )

    phylo_tree = phylotree_factory(
        phylorun_factory(viewer_group),
        [local_sample, can_see_sample, wrong_can_see_sample, no_can_see_sample],
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
    async_session.add(phylo_tree)
    await async_session.commit()

    auth_headers = {"user_id": user.auth0_user_id}
    result = await http_client.get(
        f"/v2/phylo_trees/{phylo_tree.entity_id}/download", headers=auth_headers
    )

    tree = result.json()
    assert tree["tree"] == {
        "name": "private_identifier_1",
        "GISAID_ID": "public_identifier_1",
        "children": [
            {"GISAID_ID": "public_identifier_2", "name": "private_identifier_2"},
            {"name": "public_identifier_3"},
            {
                "name": "public_identifier_4",
                "children": [{"name": "public_identifier_5"}],
            },
        ],
    }
