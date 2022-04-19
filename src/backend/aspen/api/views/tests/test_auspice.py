import json
import re
from base64 import urlsafe_b64decode, urlsafe_b64encode
from collections import namedtuple

import boto3
import pytest
from botocore.client import ClientError
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.api.views.tests.test_update_phylo_run_and_tree import make_shared_test_data
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.usergroup import group_factory, user_factory

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


Point = namedtuple("Point", ["region", "country", "latitude", "longitude"])
test_country_data = [
    Point("North America", "Canada", 61.06669235229492, -107.99170684814453),
    Point("North America", "Panama", 8.983329772949219, -79.5166015625),
    Point("North America", "Cuba", 23.013134002685547, -80.83287811279297),
    Point("North America", "Honduras", 15.257243156433105, -86.07551574707031),
    Point("North America", "Bahamas", 24.77365493774414, -78.00005340576172),
    Point("North America", "Jamaica", 18.109600067138672, -77.29750061035156),
    Point("North America", "Bermuda", 32.301822662353516, -64.76036071777344),
    Point("South America", "Aruba", 12.501362800598145, -69.96184539794922),
    Point("North America", "Haiti", 19.139995574951172, -72.35709381103516),
    Point("North America", "Belize", 16.825979232788086, -88.76009368896484),
    Point("North America", "Guatemala", 15.635608673095703, -89.89881134033203),
    Point("North America", "USA", 38.916961669921875, -98.89137268066406),
    Point("North America", "Mexico", 19.43252944946289, -99.13320922851562),
    Point("North America", "El Salvador", 13.80003833770752, -88.91407012939453),
    Point(
        "North America", "Dominican Republic", 19.097402572631836, -70.30280303955078
    ),
    Point("North America", "Costa Rica", 10.0378999710083, -83.81875610351562),
    Point("Asia", "Japan", 35.685359954833984, 139.7530975341797),
]


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
        "meta": {
            "colorings": [],
        },
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

    assert "meta" in res_json.keys()
    assert "tree" in res_json.keys()
    assert res_json["tree"]["name"] == "ROOT"
    assert res_json["tree"]["branch_attrs"]["labels"]["clade"] == "42"
    test_children = res_json["tree"]["children"]
    for index in range(1, 2):
        child = test_children[index - 1]
        assert child["name"] == f"private_identifier_{index}"
        assert child["GISAID_ID"] == f"public_identifier_{index}"


async def test_unauth_user_auspice_link_generation(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    user, group, samples, phylo_run, phylo_tree = await make_shared_test_data(
        async_session
    )
    group_that_did_not_make_tree = group_factory(name="i_want_to_see_trees")
    user_that_did_not_make_tree = user_factory(
        group_that_did_not_make_tree,
        name="trying_to_see",
        email="trying_to_see@hotmail.com",
        auth0_user_id="trying_to_see",
    )
    async_session.add(group_that_did_not_make_tree)
    async_session.add(user_that_did_not_make_tree)
    await async_session.commit()

    auth_headers = {"user_id": user_that_did_not_make_tree.auth0_user_id}
    request_body = {"tree_id": phylo_tree.entity_id}
    res = await http_client.post(
        "/v2/auspice/generate", json=request_body, headers=auth_headers
    )
    assert res.status_code == 400


async def test_tampered_magic_link(
    async_session: AsyncSession,
    http_client: AsyncClient,
    mock_s3_resource: boto3.resource,
):
    user, group, samples, phylo_run, phylo_tree = await make_shared_test_data(
        async_session
    )

    auth_headers = {"user_id": user.auth0_user_id}
    request_body = {"tree_id": phylo_tree.entity_id}
    generate_res = await http_client.post(
        "/v2/auspice/generate", json=request_body, headers=auth_headers
    )

    assert generate_res.status_code == 200
    generate_response = generate_res.json()
    magic_link = generate_response["url"]

    # Now we tamper with the link! We want to see a different tree!
    payload_plus_tag = magic_link.removeprefix("test/v2/auspice/access/")
    payload, tag = payload_plus_tag.split(".")
    decoded_payload = urlsafe_b64decode(payload).decode("utf8")
    recovered_payload = json.loads(decoded_payload)

    tampered_payload = recovered_payload | {"tree_id": phylo_tree.entity_id + 1}

    bytes_payload = json.dumps(tampered_payload).encode("utf8")
    tampered_message = urlsafe_b64encode(bytes_payload)
    tampered_payload_plus_tag = f"{tampered_message.decode('utf8')}.{tag}"

    access_res = await http_client.get(
        f"/v2/auspice/access/{tampered_payload_plus_tag}"
    )
    assert access_res.status_code == 400
    res_json = access_res.json()
    assert (
        res_json["error"] == "Unauthenticated attempt to access an auspice magic link"
    )


# This tests assumes we are using a group in the USA,
# and the test location data at the top of this file
async def test_country_color_labeling(
    async_session: AsyncSession,
    http_client: AsyncClient,
    mock_s3_resource: boto3.resource,
):
    user, group, samples, phylo_run, phylo_tree = await make_shared_test_data(
        async_session
    )

    for point in test_country_data:
        country_entry = location_factory(
            point.region,
            point.country,
            latitude=point.latitude,
            longitude=point.longitude,
        )
        async_session.add(country_entry)
    await async_session.commit()

    # We need to create the bucket since this is all in Moto's 'virtual' AWS account
    try:
        mock_s3_resource.meta.client.head_bucket(Bucket=phylo_tree.s3_bucket)
    except ClientError:
        # The bucket does not exist or you have no access.
        mock_s3_resource.create_bucket(Bucket=phylo_tree.s3_bucket)

    test_tree = {
        "meta": {
            "colorings": [],
        },
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

    assert "meta" in res_json
    assert "colorings" in res_json["meta"]

    country_colorings = None
    for category in res_json["meta"]["colorings"]:
        if category["key"] == "country":
            country_colorings = category
    assert country_colorings is not None

    test_country_names = [point.country for point in test_country_data]

    assert "scale" in country_colorings
    assert len(country_colorings["scale"]) == 16

    for country, hex_color in country_colorings["scale"]:
        assert country in test_country_names
        assert country != "Japan"
        assert re.search(r"^#(?:[0-9a-fA-F]{3}){1,2}$", hex_color) is not None
