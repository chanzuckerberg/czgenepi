import json
import re
from base64 import urlsafe_b64decode, urlsafe_b64encode

import boto3
import pytest
from botocore.client import ClientError
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.api.utils.pathogens import get_pathogen_repo_config_for_pathogen
from aspen.api.views.tests.data.location_data import TEST_COUNTRY_DATA
from aspen.api.views.tests.data.phylo_tree_data import TEST_TREE
from aspen.api.views.tests.test_update_phylo_run_and_tree import make_shared_test_data
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.usergroup import group_factory, userrole_factory
from aspen.util.split import SplitClient

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


async def test_valid_auspice_link_generation(
    async_session: AsyncSession,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    user, group, samples, phylo_run, phylo_tree, _ = await make_shared_test_data(
        async_session
    )
    auth_headers = {"user_id": user.auth0_user_id}
    request_body = {"tree_id": phylo_tree.entity_id}
    split_client.get_pathogen_treatment.return_value = "GISAID"
    res = await http_client.post(
        f"/v2/orgs/{group.id}/pathogens/{phylo_tree.pathogen.slug}/auspice/generate",
        json=request_body,
        headers=auth_headers,
    )

    assert res.status_code == 200
    response = res.json()
    assert response.get("url", None) is not None
    magic_link = response["url"]
    valid_pattern = re.compile(
        r"\/v2\/orgs\/\d+\/pathogens\/[0-9a-zA-Z]+\/auspice\/access\/[a-zA-Z\d\-_=]+\.[a-z\d]+"
    )
    assert valid_pattern.search(magic_link) is not None


async def test_valid_auspice_link_access(
    async_session: AsyncSession,
    http_client: AsyncClient,
    mock_s3_resource: boto3.resource,
    split_client: SplitClient,
):
    split_client.get_pathogen_treatment.return_value = "GISAID"
    user, group, samples, phylo_run, phylo_tree, pathogen = await make_shared_test_data(
        async_session
    )
    pathogen_repo_config = await get_pathogen_repo_config_for_pathogen(
        pathogen, "GISAID", async_session
    )
    # We need to create the bucket since this is all in Moto's 'virtual' AWS account
    try:
        mock_s3_resource.meta.client.head_bucket(Bucket=phylo_tree.s3_bucket)
    except ClientError:
        # The bucket does not exist or you have no access.
        mock_s3_resource.create_bucket(Bucket=phylo_tree.s3_bucket)

    test_json = json.dumps(TEST_TREE)

    mock_s3_resource.Bucket(phylo_tree.s3_bucket).Object(phylo_tree.s3_key).put(
        Body=test_json
    )

    auth_headers = {"user_id": user.auth0_user_id}
    request_body = {"tree_id": phylo_tree.entity_id}
    generate_res = await http_client.post(
        f"/v2/orgs/{group.id}/pathogens/{phylo_tree.pathogen.slug}/auspice/generate",
        json=request_body,
        headers=auth_headers,
    )

    assert generate_res.status_code == 200
    generate_response = generate_res.json()
    magic_link = generate_response["url"]

    access_res = await http_client.get(magic_link.removeprefix("test"))
    assert access_res.status_code == 200
    res_json = access_res.json()

    assert "meta" in res_json.keys()
    assert "tree" in res_json.keys()
    assert res_json["tree"]["name"] == f"{pathogen_repo_config.prefix}/ROOT"
    assert res_json["tree"]["branch_attrs"]["labels"]["clade"] == "42"
    test_children = res_json["tree"]["children"]
    for index in range(1, 2):
        child = test_children[index - 1]
        assert child["name"] == f"private_identifier_{index}"
        assert (
            child["GISAID_ID"]
            == f"{pathogen_repo_config.prefix}/public_identifier_{index}"
        )


async def test_unauth_user_auspice_link_generation(
    async_session: AsyncSession,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    split_client.get_pathogen_treatment.return_value = "GISAID"
    user, group, samples, phylo_run, phylo_tree, _ = await make_shared_test_data(
        async_session
    )
    split_client.get_pathogen_treatment.return_value = "GISAID"
    group_that_did_not_make_tree = group_factory(name="i_want_to_see_trees")
    user_that_did_not_make_tree = await userrole_factory(
        async_session,
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
        f"/v2/orgs/{group_that_did_not_make_tree.id}/pathogens/{phylo_tree.pathogen.slug}/auspice/generate",
        json=request_body,
        headers=auth_headers,
    )
    assert res.status_code == 400


async def test_tampered_magic_link(
    async_session: AsyncSession,
    http_client: AsyncClient,
    mock_s3_resource: boto3.resource,
    split_client: SplitClient,
):
    split_client.get_pathogen_treatment.return_value = "GISAID"
    user, group, samples, phylo_run, phylo_tree, _ = await make_shared_test_data(
        async_session
    )

    auth_headers = {"user_id": user.auth0_user_id}
    request_body = {"tree_id": phylo_tree.entity_id}
    generate_res = await http_client.post(
        f"/v2/orgs/{group.id}/pathogens/{phylo_tree.pathogen.slug}/auspice/generate",
        json=request_body,
        headers=auth_headers,
    )

    assert generate_res.status_code == 200
    generate_response = generate_res.json()
    magic_link = generate_response["url"]

    # Now we tamper with the link! We want to see a different tree!
    payload_plus_tag = magic_link.removeprefix(
        f"test/v2/orgs/1/pathogens/{phylo_tree.pathogen.slug}/auspice/access/"
    )
    payload, tag = payload_plus_tag.split(".")
    decoded_payload = urlsafe_b64decode(payload).decode("utf8")
    recovered_payload = json.loads(decoded_payload)

    tampered_payload = recovered_payload | {"tree_id": phylo_tree.entity_id + 1}

    bytes_payload = json.dumps(tampered_payload).encode("utf8")
    tampered_message = urlsafe_b64encode(bytes_payload)
    tampered_payload_plus_tag = f"{tampered_message.decode('utf8')}.{tag}"

    access_res = await http_client.get(
        f"/v2/orgs/{group.id}/pathogens/{phylo_tree.pathogen.slug}/auspice/access/{tampered_payload_plus_tag}"
    )
    assert access_res.status_code == 400
    res_json = access_res.json()
    assert (
        res_json["error"] == "Unauthenticated attempt to access an auspice magic link"
    )


# This tests assumes we are using a group from Santa Barbara, CA, USA
# and the test location data at the top of this file
async def test_country_color_labeling(
    async_session: AsyncSession,
    http_client: AsyncClient,
    mock_s3_resource: boto3.resource,
    split_client: SplitClient,
):
    split_client.get_pathogen_treatment.return_value = "GISAID"
    user, group, samples, phylo_run, phylo_tree, _ = await make_shared_test_data(
        async_session
    )

    for point in TEST_COUNTRY_DATA:
        country_entry = location_factory(
            point.region,
            point.country,
            division=point.division,
            location=point.location,
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

    test_json = json.dumps(TEST_TREE)
    mock_s3_resource.Bucket(phylo_tree.s3_bucket).Object(phylo_tree.s3_key).put(
        Body=test_json
    )

    auth_headers = {"user_id": user.auth0_user_id}
    request_body = {"tree_id": phylo_tree.entity_id}
    generate_res = await http_client.post(
        f"/v2/orgs/{group.id}/pathogens/{phylo_tree.pathogen.slug}/auspice/generate",
        json=request_body,
        headers=auth_headers,
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

    # It turns out Tokyo is closer than Paris to Santa Barbara,
    # in terms of great circle distance

    test_data_countries = set([point.country for point in TEST_COUNTRY_DATA])
    test_data_countries.add(group.default_tree_location.country)
    test_country_names = [
        "USA",
        "Mexico",
        "Canada",
        "Panama",
        "Dominican Republic",
        "Curaçao",
        "Japan",
        "Denmark",
    ]

    assert "scale" in country_colorings

    unique_countries = set()
    for country, hex_color in country_colorings["scale"]:
        assert country in test_data_countries
        assert re.search(r"^#(?:[0-9a-fA-F]{3}){1,2}$", hex_color) is not None
        unique_countries.add(country)
    print(unique_countries)
    print(country_colorings["scale"])
    assert len(unique_countries) == len(country_colorings["scale"])
    for entry in test_country_names:
        assert entry in unique_countries
    assert "France" not in unique_countries


# This tests assumes we are using a group in the USA,
# and the test location data at the top of this file
async def test_division_color_labeling(
    async_session: AsyncSession,
    http_client: AsyncClient,
    mock_s3_resource: boto3.resource,
    split_client: SplitClient,
):
    split_client.get_pathogen_treatment.return_value = "GISAID"
    user, group, samples, phylo_run, phylo_tree, _ = await make_shared_test_data(
        async_session
    )

    for point in TEST_COUNTRY_DATA:
        country_entry = location_factory(
            point.region,
            point.country,
            division=point.division,
            location=point.location,
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

    test_json = json.dumps(TEST_TREE)
    mock_s3_resource.Bucket(phylo_tree.s3_bucket).Object(phylo_tree.s3_key).put(
        Body=test_json
    )

    auth_headers = {"user_id": user.auth0_user_id}
    request_body = {"tree_id": phylo_tree.entity_id}
    generate_res = await http_client.post(
        f"/v2/orgs/{group.id}/pathogens/{phylo_tree.pathogen.slug}/auspice/generate",
        json=request_body,
        headers=auth_headers,
    )

    assert generate_res.status_code == 200
    generate_response = generate_res.json()
    magic_link = generate_response["url"]

    access_res = await http_client.get(magic_link.removeprefix("test"))
    assert access_res.status_code == 200
    res_json = access_res.json()

    assert "meta" in res_json
    assert "colorings" in res_json["meta"]

    division_colorings = None
    for category in res_json["meta"]["colorings"]:
        if category["key"] == "division":
            division_colorings = category
    assert division_colorings is not None

    test_data_divisions = set(
        [point.division for point in TEST_COUNTRY_DATA if point.division is not None]
    )
    test_data_divisions.add(group.default_tree_location.division)
    test_division_names = [
        "California",
        "Nevada",
        "La Habana",
        "National District",
        "Willemstad",
        "Kantō",
    ]

    assert "scale" in division_colorings

    unique_divisions = set()
    for location, hex_color in division_colorings["scale"]:
        assert location in test_data_divisions
        assert re.search(r"^#(?:[0-9a-fA-F]{3}){1,2}$", hex_color) is not None
        unique_divisions.add(location)
    print(unique_divisions)
    print(division_colorings["scale"])
    assert len(unique_divisions) == len(division_colorings["scale"])
    for entry in test_division_names:
        assert entry in unique_divisions
    # Denmark should now be crowded out because we have two USA divisions
    assert "Hovedstaden" not in unique_divisions


# This tests assumes we are using a group in the USA,
# and the test location data at the top of this file
async def test_location_color_labeling(
    async_session: AsyncSession,
    http_client: AsyncClient,
    api,
    mock_s3_resource: boto3.resource,
    split_client: SplitClient,
):
    split_client.get_pathogen_treatment.return_value = "GISAID"
    user, group, samples, phylo_run, phylo_tree, _ = await make_shared_test_data(
        async_session
    )

    for point in TEST_COUNTRY_DATA:
        country_entry = location_factory(
            point.region,
            point.country,
            division=point.division,
            location=point.location,
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

    test_json = json.dumps(TEST_TREE)
    mock_s3_resource.Bucket(phylo_tree.s3_bucket).Object(phylo_tree.s3_key).put(
        Body=test_json
    )

    auth_headers = {"user_id": user.auth0_user_id}
    request_body = {"tree_id": phylo_tree.entity_id}
    generate_res = await http_client.post(
        f"/v2/orgs/{group.id}/pathogens/{phylo_tree.pathogen.slug}/auspice/generate",
        json=request_body,
        headers=auth_headers,
    )

    assert generate_res.status_code == 200
    generate_response = generate_res.json()
    magic_link = generate_response["url"]
    access_res = await http_client.get(magic_link.removeprefix("test"))
    assert access_res.status_code == 200
    res_json = access_res.json()

    assert "meta" in res_json
    assert "colorings" in res_json["meta"]

    location_colorings = None
    for category in res_json["meta"]["colorings"]:
        if category["key"] == "location":
            location_colorings = category
    assert location_colorings is not None

    test_data_locations = set(
        [point.location for point in TEST_COUNTRY_DATA if point.location is not None]
    )
    test_data_locations.add(group.default_tree_location.location)
    test_location_names = [
        "Santa Barbara County",
        "Clark County",
        "Alameda County",
        "Vancouver",
        "Nassau",
        "Port-au-Prince",
        "Santo Domingo",
        "Willemstad",
    ]

    assert "scale" in location_colorings

    unique_locations = set()
    for location, hex_color in location_colorings["scale"]:
        assert location in test_data_locations
        assert re.search(r"^#(?:[0-9a-fA-F]{3}){1,2}$", hex_color) is not None
        unique_locations.add(location)
    print(unique_locations)
    print(location_colorings["scale"])
    assert len(unique_locations) == len(location_colorings["scale"])
    for entry in test_location_names:
        assert entry in unique_locations
    # Tokyo should now be crowded out because we have 3 USA locations
    assert "Tokyo" not in unique_locations
