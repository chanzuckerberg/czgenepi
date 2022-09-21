import json
import uuid
from aspen.test_infra.models.pathogen import random_pathogen_factory
from aspen.util.split import SplitClient
from aspen.api.utils.pathogens import get_pathogen_repo_config_for_pathogen

import boto3
import pytest
from botocore.client import ClientError
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.api.views.tests.test_update_phylo_run_and_tree import make_shared_test_data
from aspen.database.models import Group, Pathogen, PhyloTree, Sample
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.pathogen_repo_config import (
    setup_gisaid_and_genbank_repo_configs,
)
from aspen.test_infra.models.phylo_tree import phylorun_factory, phylotree_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_factory
from aspen.test_infra.models.usergroup import (
    group_factory,
    grouprole_factory,
    userrole_factory,
)

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


def upload_s3_file(
    mock_s3_resource: boto3.resource,
    phylo_tree: PhyloTree,
    samples: list[Sample],
    gisaid_samples=None,
):
    # Create the bucket if it doesn't exist in localstack.
    try:
        mock_s3_resource.meta.client.head_bucket(Bucket=phylo_tree.s3_bucket)
    except ClientError:
        # The bucket does not exist or you have no access.
        mock_s3_resource.create_bucket(Bucket=phylo_tree.s3_bucket)

    tree_children = [
        {"name": sample.public_identifier, "node_attrs": {"country": {"value": "USA"}}}
        for sample in samples
    ]
    if gisaid_samples:
        for gisaid_sample in gisaid_samples:
            tree_children.append({"name": gisaid_sample})

    body = {
        "meta": {
            "colorings": [],
        },
        "tree": {
            "name": "root_identifier_1",
            "children": tree_children,
        },
    }

    test_json = json.dumps(body)

    mock_s3_resource.Bucket(phylo_tree.s3_bucket).Object(phylo_tree.s3_key).put(
        Body=test_json
    )


async def create_phylotree_with_inputs(
    mock_s3_resource: boto3.resource, async_session: AsyncSession, owner_group: Group
):
    username = "owner"
    user = await userrole_factory(
        async_session,
        owner_group,
        name=username,
        auth0_user_id=username,
        email=username,
    )
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    samples = []
    input_entities = []

    pathogen = random_pathogen_factory()
    setup_gisaid_and_genbank_repo_configs(async_session, pathogen)
    pathogen_repo_config = await get_pathogen_repo_config_for_pathogen(
        pathogen, "GISAID", async_session
    )

    for i in range(3):
        sample = sample_factory(
            owner_group,
            user,
            location,
            pathogen=pathogen,
            public_identifier=str(uuid.uuid4()),
            private_identifier=str(uuid.uuid4()),
        )
        input_entity = uploaded_pathogen_genome_factory(
            sample, sequence="ATGCAAAAAA" * i
        )
        samples.append(sample)
        input_entities.append(input_entity)

    db_gisaid_samples = [f"{pathogen_repo_config.prefix}/gisaid_identifier", f"{pathogen_repo_config.prefix}/gisaid_identifier2"]

    phylo_run = phylorun_factory(
        owner_group,
        inputs=input_entities,
        gisaid_ids=db_gisaid_samples,
        pathogen=pathogen,
    )
    phylo_tree = phylotree_factory(
        phylo_run,
        samples,
    )
    tree_gisaid_samples = ["gisaid_identifier", f"{pathogen_repo_config.prefix}/GISAID_identifier2"]
    upload_s3_file(mock_s3_resource, phylo_tree, samples, tree_gisaid_samples)

    async_session.add_all([phylo_tree])
    await async_session.commit()
    return phylo_tree, phylo_run, samples, pathogen


async def create_phylotree(
    mock_s3_resource: boto3.resource, async_session: AsyncSession, sample_as_input=False
):
    owner_group = group_factory()
    user = await userrole_factory(async_session, owner_group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    pathogen = random_pathogen_factory()
    setup_gisaid_and_genbank_repo_configs(async_session, pathogen)

    sample = sample_factory(
        owner_group,
        user,
        location,
        pathogen=pathogen,
        public_identifier=str(uuid.uuid4()),
        private_identifier=str(uuid.uuid4()),
    )
    upg = uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")

    samples = [sample]
    run_inputs = []
    if sample_as_input:
        run_inputs = [upg]

    phylo_tree = phylotree_factory(
        phylorun_factory(owner_group, pathogen=pathogen, inputs=run_inputs),
        samples,
    )
    upload_s3_file(mock_s3_resource, phylo_tree, samples)

    async_session.add_all([phylo_tree, owner_group, owner_group])
    await async_session.commit()
    return user, owner_group, phylo_tree, samples, pathogen


async def test_tree_metadata_download(
    mock_s3_resource: boto3.resource,
    async_session: AsyncSession,
    http_client: AsyncClient,
    split_client: SplitClient
):
    """
    Test a regular tsv download for a sample submitted by the user's group
    """
    user, group, phylo_tree, samples, pathogen = await create_phylotree(
        mock_s3_resource, async_session
    )
    split_client.get_pathogen_treatment.return_value = "GISAID"

    auth_headers = {"name": user.name, "user_id": user.auth0_user_id}
    res = await http_client.get(
        f"/v2/orgs/{group.id}/pathogens/{phylo_tree.pathogen.slug}/phylo_trees/{phylo_tree.entity_id}/sample_ids",
        headers=auth_headers,
    )
    pathogen_repo_config = await get_pathogen_repo_config_for_pathogen(
        pathogen, "GISAID", async_session
    )
    expected_filename = f"{phylo_tree.id}_sample_ids.tsv"
    expected_document = (
        "Sample Identifier\tSelected\r\n" f"{pathogen_repo_config.prefix}/root_identifier_1	no\r\n"
    )
    for sample in samples:
        expected_document += f"{sample.private_identifier}	no\r\n"
    file_contents = str(res.content, encoding="UTF-8")

    assert file_contents == expected_document
    assert res.status_code == 200
    assert res.headers["Content-Type"] == "text/tsv"
    assert (
        res.headers["Content-Disposition"]
        == f"attachment; filename={expected_filename}"
    )


async def create_unique_user(db: AsyncSession, group: Group, username: str):
    user = await userrole_factory(
        db, group, name=username, auth0_user_id=username, email=username
    )
    return user


async def test_private_id_matrix(
    mock_s3_resource: boto3.resource,
    async_session: AsyncSession,
    http_client: AsyncClient,
    split_client: SplitClient
):
    """
    Test that we use public ids in the fasta file if the requester only has access to the
    samples sequence data but not private ids
    """
    owner_group = group_factory(name="owner_group")
    noaccess_group = group_factory(name="noaccess_group")
    viewer_group = group_factory(name="viewer_group")
    viewer_user = await create_unique_user(async_session, viewer_group, "viewer")
    noaccess_user = await create_unique_user(async_session, noaccess_group, "noaccess")
    phylo_tree, phylo_run, samples, pathogen = await create_phylotree_with_inputs(
        mock_s3_resource, async_session, owner_group
    )
    # give the viewer group access to trees from the owner group
    roles = await grouprole_factory(async_session, owner_group, viewer_group)
    pathogen_repo_config = await get_pathogen_repo_config_for_pathogen(
        pathogen, "GISAID", async_session
    )
    async_session.add_all(roles + [noaccess_user, viewer_user, phylo_tree])
    await async_session.commit()
    split_client.get_pathogen_treatment.return_value = "GISAID"
    matrix = [
        {
            "user": noaccess_user,
            "group": noaccess_group,
            "expected_status": 400,
            "expected_data": f'{{"error":"PhyloTree with id {phylo_tree.id} not viewable by user"}}',
        },
        {
            "user": viewer_user,
            "group": viewer_group,
            "expected_status": 200,
            "expected_data": (
                "Sample Identifier\tSelected\r\n"
                f"{pathogen_repo_config.prefix}/root_identifier_1	no\r\n"
                f"{pathogen_repo_config.prefix}/{samples[0].public_identifier}	yes\r\n"
                f"{pathogen_repo_config.prefix}/{samples[1].public_identifier}	yes\r\n"
                f"{pathogen_repo_config.prefix}/{samples[2].public_identifier}	yes\r\n"
                f"{pathogen_repo_config.prefix}/gisaid_identifier	yes\r\n"
                f"{pathogen_repo_config.prefix}/GISAID_identifier2	yes\r\n"
            ),
        },
    ]
    for case in matrix:
        user = case["user"]
        auth_headers = {"name": user.name, "user_id": user.auth0_user_id}
        res = await http_client.get(
            f"/v2/orgs/{case['group'].id}/pathogens/{phylo_tree.pathogen.slug}/phylo_trees/{phylo_tree.entity_id}/sample_ids",
            headers=auth_headers,
        )

        assert res.status_code == case["expected_status"]
        file_contents = str(res.content, encoding="UTF-8")
        assert file_contents == case["expected_data"]


async def test_tree_metadata_replaces_all_ids(
    mock_s3_resource: boto3.resource,
    async_session: AsyncSession,
    http_client: AsyncClient,
    split_client: SplitClient
):
    """
    Test a regular tsv download for a sample submitted by the user's group
    """
    user, group, phylo_tree, samples, pathogen = await create_phylotree(
        mock_s3_resource, async_session, True
    )

    extra_sample = sample_factory(
        group,
        user,
        samples[0].collection_location,
        pathogen=phylo_tree.pathogen,
        public_identifier=str(uuid.uuid4()),
        private_identifier=str(uuid.uuid4()),
    )
    uploaded_pathogen_genome_factory(extra_sample, sequence="GGGATGCAAAAAA")
    # Write an extra sample to our s3 file. This sample isn't part of the
    # list of "inputs" into the phylo_run job, but it *should still have
    # its public identifiers converted to private ids!!!*
    upload_s3_file(mock_s3_resource, phylo_tree, samples + [extra_sample])

    async_session.add(extra_sample)
    await async_session.commit()
    await async_session.flush()

    auth_headers = {"name": user.name, "user_id": user.auth0_user_id}
    split_client.get_pathogen_treatment.return_value = "GISAID"
    res = await http_client.get(
        f"/v2/orgs/{group.id}/pathogens/{phylo_tree.pathogen.slug}/phylo_trees/{phylo_tree.entity_id}/sample_ids",
        headers=auth_headers,
    )
    pathogen_repo_config = await get_pathogen_repo_config_for_pathogen(
        pathogen, "GISAID", async_session
    )
    assert res.status_code == 200
    expected_data = (
        "Sample Identifier\tSelected\r\n"
        f"{pathogen_repo_config.prefix}/root_identifier_1	no\r\n"
        f"{samples[0].private_identifier}	yes\r\n"
        f"{extra_sample.private_identifier}	no\r\n"
    )
    file_contents = str(res.content, encoding="UTF-8")
    assert file_contents == expected_data


async def test_public_tree_metadata_replaces_all_ids(
    mock_s3_resource: boto3.resource,
    async_session: AsyncSession,
    http_client: AsyncClient,
    split_client: SplitClient
):
    """
    Test a regular tsv download for public identifiers
    """
    user, group, phylo_tree, samples, pathogen = await create_phylotree(
        mock_s3_resource, async_session, True
    )

    extra_sample = sample_factory(
        group,
        user,
        samples[0].collection_location,
        pathogen=phylo_tree.pathogen,
        public_identifier=str(uuid.uuid4()),
        private_identifier=str(uuid.uuid4()),
    )
    uploaded_pathogen_genome_factory(extra_sample, sequence="GGGATGCAAAAAA")
    # Write an extra sample to our s3 file. This sample isn't part of the
    # list of "inputs" into the phylo_run job, but it *should still have
    # its public identifiers converted to private ids!!!*
    upload_s3_file(mock_s3_resource, phylo_tree, samples + [extra_sample])

    async_session.add(extra_sample)
    await async_session.commit()
    await async_session.flush()

    auth_headers = {"name": user.name, "user_id": user.auth0_user_id}
    split_client.get_pathogen_treatment.return_value = "GISAID"
    res = await http_client.get(
        f"/v2/orgs/{group.id}/pathogens/{phylo_tree.pathogen.slug}/phylo_trees/{phylo_tree.entity_id}/sample_ids?id_style=public",
        headers=auth_headers,
    )
    assert res.status_code == 200
    pathogen_repo_config = await get_pathogen_repo_config_for_pathogen(
        pathogen, "GISAID", async_session
    )
    expected_data = (
        "Sample Identifier\tSelected\r\n"
        f"{pathogen_repo_config.prefix}/root_identifier_1	no\r\n"
        f"{pathogen_repo_config.prefix}/{samples[0].public_identifier}	yes\r\n"
        f"{pathogen_repo_config.prefix}/{extra_sample.public_identifier}	no\r\n"
    )
    file_contents = str(res.content, encoding="UTF-8")
    assert file_contents == expected_data


async def test_download_samples_unauthorized(
    mock_s3_resource: boto3.resource,
    async_session: AsyncSession,
    http_client: AsyncClient,
    split_client: SplitClient
):
    """
    Test downloading samples for a tree you don't have access to.
    """
    user, group, samples, _, phylo_tree, _ = await make_shared_test_data(async_session)
    upload_s3_file(mock_s3_resource, phylo_tree, samples)

    noaccess_group = group_factory(name="meanie")
    noaccess_user = await userrole_factory(
        async_session,
        noaccess_group,
        auth0_user_id="meanie",
        email="meanie@czgenepi.org",
    )
    async_session.add(noaccess_user)
    async_session.add(noaccess_group)
    await async_session.commit()
    await async_session.flush()

    auth_headers = {"name": noaccess_user.name, "user_id": noaccess_user.auth0_user_id}
    split_client.get_pathogen_treatment.return_value = "GISAID"
    res = await http_client.get(
        f"/v2/orgs/{group.id}/pathogens/{phylo_tree.pathogen.slug}/phylo_trees/{phylo_tree.entity_id}/sample_ids?id_style=public",
        headers=auth_headers,
    )
    assert res.status_code == 403
