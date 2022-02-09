import json
import re

import boto3
import pytest
from botocore.client import ClientError
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.api.views.tests.test_update_phylo_run_and_tree import make_shared_test_data

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


async def test_valid_auspice_link_generation(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    user, group, samples, phylo_run, phylo_tree = await make_shared_test_data(
        async_session
    )
    auth_headers = {"user_id": user.auth0_user_id}
    request_body = {"tree_id": phylo_tree.entity_id}
    res = await http_client.post(
        "/v2/auspice/generate", json=request_body, headers=auth_headers
    )

    assert res.status_code == 200
    response = res.json()
    assert response.get("url", None) is not None
    magic_link = response["url"]
    valid_pattern = re.compile(r"\/v2\/auspice\/access\/[a-zA-Z\d\-_=]+\.[a-z\d]+")
    assert valid_pattern.search(magic_link) is not None


async def test_valid_auspice_link_access(
    async_session: AsyncSession,
    http_client: AsyncClient,
    mock_s3_resource: boto3.resource,
):
    user, group, samples, phylo_run, phylo_tree = await make_shared_test_data(
        async_session
    )
    # We need to create the bucket since this is all in Moto's 'virtual' AWS account
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
    }
    test_json = json.dumps(test_tree)

    mock_s3_resource.Bucket(phylo_tree.s3_bucket).Object(phylo_tree.s3_key).put(
        Body=test_json
    )

    auth_headers = {"user_id": user.auth0_user_id}
    request_body = {"tree_id": phylo_tree.entity_id}
    generate_res = await http_client.post(
        "/v2/auspice/generate", json=request_body, headers=auth_headers
    )

    assert generate_res.status_code == 200
    generate_response = generate_res.json()
    magic_link = generate_response["url"]

    access_res = await http_client.get(magic_link.removeprefix("test"))
    assert access_res.status_code == 200
    res_json = access_res.json()
    print(res_json)
    assert "meta" in res_json.keys()
    assert "tree" in res_json.keys()
    assert res_json["tree"]["name"] == "ROOT"
    assert res_json["tree"]["branch_attrs"]["labels"]["clade"] == "42"
    test_children = res_json["tree"]["children"]
    for index in range(1, 2):
        child = test_children[index - 1]
        assert child["name"] == f"private_identifier_{index}"
        assert child["GISAID_ID"] == f"public_identifier_{index}"
