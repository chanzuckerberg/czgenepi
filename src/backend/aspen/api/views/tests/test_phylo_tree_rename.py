import json

import boto3
import pytest
from botocore.client import ClientError
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.database.models.pathogens import Pathogen
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.pathogen_repo_config import (
    setup_gisaid_and_genbank_repo_configs,
)
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
        "name": "public_identifier_0",
        "children": [
            {"name": "public_identifier_can_see_0"},
            {"name": "public_identifier_can_see_1"},
            {
                "name": "public_identifier_wrong_0",
                "children": [
                    {"name": "public_identifier_1"},
                    {"name": "public_identifier_wrong_1"},
                    {"name": "public_identifier_nosee_0"},
                    {"name": "public_identifier_nosee_1"},
                ],
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
    # we need SC2 so we can get the correct treatment from split
    pathogen = Pathogen(slug="SC2", name="sars-cov-2")
    setup_gisaid_and_genbank_repo_configs(async_session, pathogen)
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

    local_samples = [
        sample_factory(
            viewer_group,
            user,
            location,
            pathogen=pathogen,
            private_identifier=f"private_identifier_{i}",
            public_identifier=f"public_identifier_{i}",
        )
        for i in range(2)
    ]
    # NOTE - our test user *can see* private identifiers for samples from this group!
    can_see_samples = [
        sample_factory(
            can_see_group,
            user,
            location,
            pathogen=pathogen,
            private_identifier=f"private_identifier_can_see_{i}",
            # Make sure our renaming works properly if our db samples have the gisaid prefix in them.
            public_identifier=f"hCoV-19/public_identifier_can_see_{i}",
        )
        for i in range(2)
    ]
    wrong_can_see_samples = [
        sample_factory(
            wrong_can_see_group,
            user,
            location,
            pathogen=pathogen,
            private_identifier=f"private_identifer_wrong_{i}",
            public_identifier=f"public_identifier_wrong_{i}",
        )
        for i in range(2)
    ]
    no_can_see_samples = [
        sample_factory(
            no_can_see_group,
            user,
            location,
            pathogen=pathogen,
            private_identifier=f"private_identifer_nosee_{i}",
            public_identifier=f"public_identifier_nosee_{i}",
        )
        for i in range(2)
    ]

    phylo_tree = phylotree_factory(
        phylorun_factory(viewer_group, pathogen=pathogen),
        local_samples + can_see_samples + wrong_can_see_samples + no_can_see_samples,
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
        f"/v2/orgs/{viewer_group.id}/pathogens/{pathogen.slug}/phylo_trees/{phylo_tree.entity_id}/download",
        headers=auth_headers,
    )

    tree = result.json()
    assert tree["tree"] == {
        "name": "private_identifier_0",
        "GISAID_ID": "hCoV-19/public_identifier_0",
        "children": [
            {
                "GISAID_ID": "hCoV-19/public_identifier_can_see_0",
                "name": "private_identifier_can_see_0",
            },
            {
                "GISAID_ID": "hCoV-19/public_identifier_can_see_1",
                "name": "private_identifier_can_see_1",
            },
            {
                "name": "hCoV-19/public_identifier_wrong_0",
                "children": [
                    {
                        "GISAID_ID": "hCoV-19/public_identifier_1",
                        "name": "private_identifier_1",
                    },
                    {"name": "hCoV-19/public_identifier_wrong_1"},
                    {"name": "hCoV-19/public_identifier_nosee_0"},
                    {"name": "hCoV-19/public_identifier_nosee_1"},
                ],
            },
        ],
    }
