from typing import TypedDict

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.api.views.sequences import get_fasta_filename
from aspen.database.models import Sample
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.pathogen_repo_config import (
    setup_gisaid_and_genbank_repo_configs,
)
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_factory
from aspen.test_infra.models.usergroup import (
    group_factory,
    grouprole_factory,
    userrole_factory,
)

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


async def setup_sequences_download_test_data(
    async_session: AsyncSession,
):
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    sample = sample_factory(group, user, location, private_identifier="hCoV-19/private_identifer",)
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    setup_gisaid_and_genbank_repo_configs(async_session)

    async_session.add(group)
    await async_session.commit()
    return group, user, sample


async def test_prepare_sequences_download_gisaid(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test a regular sequence download for a sample submitted by the user's group, test prefixes are correctly added for GISAID
    """

    group, user, sample = await setup_sequences_download_test_data(async_session)

    auth_headers = {"name": user.name, "user_id": user.auth0_user_id}
    data = {
        "sample_ids": [sample.public_identifier],
        "public_repository_name": "GISAID",
    }
    res = await http_client.post(
        f"/v2/orgs/{group.id}/sequences/", headers=auth_headers, json=data
    )
    assert res.status_code == 200
    expected_filename = get_fasta_filename("GISAID", group.name)
    assert (
        res.headers["Content-Disposition"]
        == f"attachment; filename={expected_filename}"
    )
    file_contents = str(res.content, encoding="UTF-8")
    assert "ATGCAAAAAA" in file_contents
    id_w_old_prefix_stripped = sample.private_identifier.lstrip("hCoV-19/")
    assert file_contents.startswith(f">hCoV-19/{id_w_old_prefix_stripped}")
    assert sample.private_identifier in file_contents


async def test_prepare_sequences_download_genbank(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test a regular sequence download for a sample submitted by the user's group, test prefixes are correctly added for GenBank
    """
    group, user, sample = await setup_sequences_download_test_data(async_session)

    auth_headers = {"name": user.name, "user_id": user.auth0_user_id}
    data = {
        "sample_ids": [sample.public_identifier],
        "public_repository_name": "GenBank",
    }
    res = await http_client.post(
        f"/v2/orgs/{group.id}/sequences/", headers=auth_headers, json=data
    )
    assert res.status_code == 200
    expected_filename = get_fasta_filename("GenBank", group.name)
    assert (
        res.headers["Content-Disposition"]
        == f"attachment; filename={expected_filename}"
    )
    file_contents = str(res.content, encoding="UTF-8")
    assert "ATGCAAAAAA" in file_contents
    id_w_old_prefix_stripped = sample.private_identifier.lstrip("hCoV-19/")
    assert file_contents.startswith(f">SARS-CoV-2/human/{id_w_old_prefix_stripped}")


async def test_prepare_sequences_download_public_database_DNE(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test that error message is returned if public repository name is not found
    """

    group, user, sample = await setup_sequences_download_test_data(async_session)

    auth_headers = {"name": user.name, "user_id": user.auth0_user_id}
    data = {
        "sample_ids": [sample.public_identifier],
        "public_repository_name": "does not exist",
    }
    res = await http_client.post(
        f"/v2/orgs/{group.id}/sequences/", headers=auth_headers, json=data
    )

    assert (
        res.text
        == '{"error":"no prefix found for given pathogen_slug and public_repository combination"}'
    )
    assert res.status_code == 500


async def test_prepare_sequences_download_no_submission(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test a regular sequence download for a sample submitted by the user's group, test prefixes are correctly added for GenBank
    """
    group, user, sample = await setup_sequences_download_test_data(async_session)

    auth_headers = {"name": user.name, "user_id": user.auth0_user_id}
    data = {
        "sample_ids": [sample.public_identifier],
    }
    res = await http_client.post(
        f"/v2/orgs/{group.id}/sequences/", headers=auth_headers, json=data
    )
    assert res.status_code == 200
    expected_filename = get_fasta_filename(None, group.name)
    assert (
        res.headers["Content-Disposition"]
        == f"attachment; filename={expected_filename}"
    )
    file_contents = str(res.content, encoding="UTF-8")
    assert "ATGCAAAAAA" in file_contents
    assert file_contents.startswith(f">{sample.private_identifier}")
    assert sample.private_identifier in file_contents


async def test_prepare_sequences_download_no_access(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test that we throw an error if the user requests a sequence they don't have access to
    """
    # create a sample for one group and another viewer group
    owner_group = group_factory()
    viewer_group = group_factory(name="County")
    viewer = await userrole_factory(async_session, viewer_group)
    owner = await userrole_factory(
        async_session,
        owner_group,
        name="Owner",
        auth0_user_id="owner_id",
        email="owner@ownergroup.org",
    )
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    sample = sample_factory(owner_group, owner, location)
    uploaded_pathogen_genome_factory(sample)

    async_session.add_all((owner_group, viewer_group))
    await async_session.commit()

    # try and access the sample with the user from the group that does not have access
    auth_headers = {"name": viewer.name, "user_id": viewer.auth0_user_id}
    data = {
        "sample_ids": [sample.public_identifier],
    }
    res = await http_client.post(
        f"/v2/orgs/{viewer_group.id}/sequences/", headers=auth_headers, json=data
    )
    assert res.status_code == 200
    assert res.content == b""


async def test_prepare_sequences_download_viewer_no_access(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test that we don't allow download of other groups' sequences
    """
    owner_group = group_factory()
    viewer_group = group_factory(name="CDPH")
    user = await userrole_factory(async_session, viewer_group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    sample = sample_factory(owner_group, user, location)
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    # give the viewer group access to the sequences from the owner group
    group_roles = await grouprole_factory(async_session, owner_group, viewer_group)
    async_session.add_all(group_roles + [owner_group, viewer_group, user, sample])
    await async_session.commit()

    auth_headers = {"name": user.name, "user_id": user.auth0_user_id}
    data = {
        "sample_ids": [sample.public_identifier],
    }
    res = await http_client.post(
        f"/v2/orgs/{viewer_group.id}/sequences/", headers=auth_headers, json=data
    )

    assert res.status_code == 200
    assert res.content == b""


async def test_access_matrix(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test that we use public ids in the fasta file if the requester only has access to the samples
    sequence data but not private ids
    """
    owner_group1 = group_factory(name="group1")
    owner_group2 = group_factory(name="group2")
    viewer_group = group_factory(name="CDPH")
    user = await userrole_factory(async_session, viewer_group)
    owner = await userrole_factory(
        async_session,
        owner_group1,
        email="owner@ownersite.com",
        name="Owner User",
        auth0_user_id="owner1",
    )
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    setup_gisaid_and_genbank_repo_configs(async_session)
    # give the viewer group access to the sequences from the owner group
    roles = []
    roles.extend(await grouprole_factory(async_session, owner_group1, viewer_group))
    roles.extend(await grouprole_factory(async_session, owner_group2, viewer_group))
    sample1 = sample_factory(
        owner_group1,
        user,
        location,
        private_identifier="sample1",
        public_identifier="pub1",
    )
    sample2 = sample_factory(
        owner_group2,
        user,
        location,
        private_identifier="sample2",
        public_identifier="pub2",
    )
    sample3 = sample_factory(
        viewer_group,
        user,
        location,
        private_identifier="sample3",
        public_identifier="pub3",
    )
    sample4 = sample_factory(
        owner_group1,
        user,
        location,
        private_identifier="sample4",
        public_identifier="pub4",
        private=True,
    )
    sequences = {"sample1": "CAT", "sample2": "TAC", "sample3": "ATC", "sample4": "CCC"}

    uploaded_pathogen_genome_factory(sample1, sequence="CAT")
    uploaded_pathogen_genome_factory(sample2, sequence="TAC")
    uploaded_pathogen_genome_factory(sample3, sequence="ATC")
    uploaded_pathogen_genome_factory(sample4, sequence="CCC")

    async_session.add_all(roles + [owner_group1, owner_group2, viewer_group, owner])
    await async_session.commit()

    # Make sure sample owners can see their own (shared & private) samples.
    owner_headers = {"name": owner.name, "user_id": owner.auth0_user_id}
    data = {"sample_ids": [sample1.public_identifier, sample4.public_identifier]}
    res = await http_client.post(
        f"/v2/orgs/{owner_group1.id}/sequences/", headers=owner_headers, json=data
    )

    assert res.status_code == 200
    file_contents = str(res.content, encoding="UTF-8")

    # Assert that we get the correct public, private id's and sequences.
    assert f">{sample1.private_identifier}" in file_contents
    assert f">{sample4.private_identifier}" in file_contents

    user_headers = {"name": user.name, "user_id": user.auth0_user_id}

    samples_public_ids: list[str] = [
        sample1.public_identifier,
        sample2.public_identifier,
        sample3.public_identifier,
        sample4.public_identifier,
    ]
    samples_private_ids: list[str] = [
        sample1.private_identifier,
        sample2.private_identifier,
        sample3.private_identifier,
        sample4.private_identifier,
    ]

    class SequenceTestCase(TypedDict):
        samples: list[str]
        expected_public: list[Sample]
        expected_private: list[Sample]
        not_expected: list[Sample]

    matrix: list[SequenceTestCase] = [
        {
            "samples": samples_public_ids,
            "expected_public": [],
            "expected_private": [
                sample3,
            ],
            "not_expected": [sample1, sample2, sample4],
        },
        {
            "samples": samples_private_ids,
            "expected_public": [],
            "expected_private": [sample3],
            "not_expected": [sample1, sample2, sample4],
        },
    ]
    for case in matrix:
        data = {
            "sample_ids": case["samples"],
        }
        res = await http_client.post(
            f"/v2/orgs/{viewer_group.id}/sequences/", headers=user_headers, json=data
        )

        assert res.status_code == 200
        expected_filename = f"{viewer_group.name}_sample_sequences.fasta"
        assert (
            res.headers["Content-Disposition"]
            == f"attachment; filename={expected_filename}"
        )
        file_contents = str(res.content, encoding="UTF-8")
        print(file_contents)

        # Assert that we get the correct public, private id's and sequences.
        for sample in case["expected_public"]:
            assert f">{sample.public_identifier}" in file_contents
            assert f">{sample.private_identifier}" not in file_contents
            assert sequences[sample.private_identifier] in file_contents
        for sample in case["expected_private"]:
            assert f">{sample.private_identifier}" in file_contents
            assert f">{sample.public_identifier}" not in file_contents
            assert sequences[sample.private_identifier] in file_contents
        for sample in case["not_expected"]:
            assert f">{sample.private_identifier}" not in file_contents
            assert f">{sample.public_identifier}" not in file_contents
            assert sequences[sample.private_identifier] not in file_contents
