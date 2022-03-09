import json
import re
from base64 import urlsafe_b64decode, urlsafe_b64encode

import boto3
import pytest
from botocore.client import ClientError
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.api.views.tests.test_update_phylo_run_and_tree import make_shared_test_data
from aspen.test_infra.models.usergroup import group_factory, user_factory

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


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

    test_tree = {
        "meta": {},
        "tree": {
            "branch_attrs": {"labels": {"clade": "42"}, "mutations": {}},
            "children": [
                {"name": "public_identifier_1"},
                {"name": "public_identifier_2"},
            ],
            "name": "ROOT",
        },
        "version": "1.3.3.7",
    }
    test_json = json.dumps(test_tree)

    mock_s3_resource.Bucket(phylo_tree.s3_bucket).Object(phylo_tree.s3_key).put(
        Body=test_json
    )

    auth_headers = {"name": user.name, "user_id": user.auth0_user_id}
    result = await http_client.get(
        f"/v2/phylo_runs/{phylo_tree.id}", headers=auth_headers
    )
    assert result == json.loads(test_json)


# def test_phylo_tree_no_can_see(
#     mock_s3_resource,
#     test_data_dir,
#     session,
#     app,
#     client,
#     n_samples=5,
#     n_trees=1,
# ):
#     owner_group: Group = group_factory()
#     viewer_group: Group = group_factory("CADPH")
#     user: User = user_factory(viewer_group)
#     location: Location = location_factory(
#         "North America", "USA", "California", "Santa Barbara County"
#     )
#     _, _, trees, _ = make_all_test_data(owner_group, user, location, n_samples, n_trees)

#     phylo_tree = trees[0]  # we only have one
#     # Create the bucket if it doesn't exist in localstack.
#     try:
#         mock_s3_resource.meta.client.head_bucket(Bucket=phylo_tree.s3_bucket)
#     except ClientError:
#         # The bucket does not exist or you have no access.
#         mock_s3_resource.create_bucket(Bucket=phylo_tree.s3_bucket)

#     json_test_file = test_data_dir / "ncov_aspen.json"
#     with json_test_file.open() as fh:
#         test_json = json.dumps(json.load(fh))

#     mock_s3_resource.Bucket(phylo_tree.s3_bucket).Object(phylo_tree.s3_key).put(
#         Body=test_json
#     )

#     session.add_all((owner_group, viewer_group))
#     session.commit()

#     with client.session_transaction() as sess:
#         sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
#     results = client.get(f"/api/phylo_tree/{trees[0].id}").get_data(as_text=True)
#     assert (
#         results
#         == f'{{"error":"PhyloTree with id {phylo_tree.id} not viewable by user with id: {user.id}"}}\n'
#     )


# def test_phylo_tree_admin(
#     mock_s3_resource,
#     test_data_dir,
#     session,
#     app,
#     client,
#     n_samples=5,
#     n_trees=1,
# ):
#     owner_group: Group = group_factory()
#     viewer_group: Group = group_factory("admin")
#     user: User = user_factory(viewer_group, system_admin=True)
#     location: Location = location_factory(
#         "North America", "USA", "California", "Santa Barbara County"
#     )
#     _, _, trees, _ = make_all_test_data(owner_group, user, location, n_samples, n_trees)

#     phylo_tree = trees[0]  # we only have one
#     # Create the bucket if it doesn't exist in localstack.
#     try:
#         mock_s3_resource.meta.client.head_bucket(Bucket=phylo_tree.s3_bucket)
#     except ClientError:
#         # The bucket does not exist or you have no access.
#         mock_s3_resource.create_bucket(Bucket=phylo_tree.s3_bucket)

#     json_test_file = test_data_dir / "ncov_aspen.json"
#     with json_test_file.open() as fh:
#         test_json = json.dumps(json.load(fh))

#     mock_s3_resource.Bucket(phylo_tree.s3_bucket).Object(phylo_tree.s3_key).put(
#         Body=test_json
#     )

#     session.add_all((owner_group, viewer_group))
#     session.commit()

#     with client.session_transaction() as sess:
#         sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
#     # Don't check the tree data because the constituent samples for each tree is random,
#     # and as such, the remap to private identifiers is not deterministic.
#     json.loads(client.get(f"/api/phylo_tree/{trees[0].id}").get_data(as_text=True))
