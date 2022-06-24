import json

import boto3
import pytest
from botocore.client import ClientError
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.api.utils import process_phylo_tree
from aspen.database.models import CanSee, DataType
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.phylo_tree import phylorun_factory, phylotree_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.usergroup import group_factory, userrole_factory

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
    async_session: AsyncSession, mock_s3_resource: boto3.resource
):
    """Create a set of samples belonging to different groups with different levels of
    can-see relationships.  Rename the nodes according to the can-see rules, and verify
    that the nodes are renamed correctly."""
    viewer_group = group_factory()
    can_see_group = group_factory("can_see")
    wrong_can_see_group = group_factory("wrong_can_see")
    no_can_see_group = group_factory("no_can_see")
    can_see_group.can_be_seen_by.append(
        CanSee(
            viewer_group=viewer_group,
            owner_group=can_see_group,
            data_type=DataType.PRIVATE_IDENTIFIERS,
        )
    )
    wrong_can_see_group.can_be_seen_by.append(
        CanSee(
            viewer_group=viewer_group,
            owner_group=wrong_can_see_group,
            data_type=DataType.SEQUENCES,
        )
    )
    user = await userrole_factory(async_session, viewer_group)
    async_session.add_all(
        [viewer_group, can_see_group, wrong_can_see_group, no_can_see_group]
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
    # NOTE - our test user *can see* private identifiers for samples from
    # this group, but we're *only* translating ID's for the samples that belong
    # *to the group the tree belongs to* so these won't be translated right now.
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

    # this is mandatory because we use an id to reference the tree.
    async_session.add(phylo_tree)
    await async_session.commit()

    tree = await process_phylo_tree(async_session, user, phylo_tree.entity_id)

    assert tree["tree"] == {
        "name": "private_identifier_1",
        "GISAID_ID": "public_identifier_1",
        "children": [
            {"name": "public_identifier_2"},
            {"name": "public_identifier_3"},
            {
                "name": "public_identifier_4",
                "children": [{"name": "public_identifier_5"}],
            },
        ],
    }


async def test_phylo_tree_rename_admin(
    async_session: AsyncSession, mock_s3_resource: boto3.resource
):
    """Create a set of samples belonging to a different group, but visible because the
    viewer is an admin.  Verify that the nodes are renamed correctly."""
    viewer_group = group_factory()
    owner_group = group_factory("no_can_see")
    user = await userrole_factory(async_session, viewer_group)
    viewer_group.can_see = []
    async_session.add_all([viewer_group, owner_group])

    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )

    renamed_sample = sample_factory(
        viewer_group,
        user,
        location,
        private_identifier="private_identifier_1",
        public_identifier="public_identifier_1",
    )

    phylo_tree = phylotree_factory(
        phylorun_factory(viewer_group),
        [renamed_sample],
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

    # this is mandatory because we use an id to reference the tree.
    async_session.add(phylo_tree)
    await async_session.commit()

    tree = await process_phylo_tree(async_session, user, phylo_tree.entity_id)

    assert tree["tree"] == {
        "name": "private_identifier_1",
        "GISAID_ID": "public_identifier_1",
        "children": [
            {"name": "public_identifier_2"},
            {"name": "public_identifier_3"},
            {
                "name": "public_identifier_4",
                "children": [{"name": "public_identifier_5"}],
            },
        ],
    }
