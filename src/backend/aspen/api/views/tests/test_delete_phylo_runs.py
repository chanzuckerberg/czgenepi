from typing import Collection

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.database.models import Group, PhyloTree, Sample, WorkflowStatusType
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.phylo_tree import phylorun_factory, phylotree_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_factory
from aspen.test_infra.models.usergroup import group_factory, userrole_factory
from aspen.test_infra.models.workflow import aligned_gisaid_dump_factory

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


def make_tree(
    group: Group,
    samples: Collection[Sample],
    tree_suffix: str,
    status: WorkflowStatusType,
) -> PhyloTree:
    # make up to n trees, each with a random sample of uploaded pathogen genomes.
    return phylotree_factory(
        phylorun_factory(
            group,
            workflow_status=status,
        ),
        samples,
        key=f"phylo_tree_{tree_suffix}",
    )  # type: ignore


async def test_delete_phylo_run_matrix(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test phylo tree deletion success
    """
    group = group_factory(name="group1")
    group2 = group_factory(name="group2")
    user = await userrole_factory(
        async_session, group, auth0_user_id="user1", email="user1"
    )
    user2 = await userrole_factory(
        async_session, group2, auth0_user_id="user2", email="user2"
    )
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    sample = sample_factory(group, user, location)
    gisaid_dump = aligned_gisaid_dump_factory()
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    async_session.add(group)
    async_session.add(gisaid_dump)

    tree1: PhyloTree = make_tree(
        group, [sample], "tree1", status=WorkflowStatusType.COMPLETED
    )
    tree2: PhyloTree = make_tree(group, [], "tree2", status=WorkflowStatusType.STARTED)
    async_session.add_all([tree1, tree2, user2])

    await async_session.commit()

    cases = [
        {
            "user": user.auth0_user_id,
            "group": group,
            "status_code": 200,
            "tree": tree1.producing_workflow_id,
        },
        {
            "user": user2.auth0_user_id,
            "group": group2,
            "status_code": 404,
            "tree": tree2.producing_workflow_id,
        },
        {
            "user": user2.auth0_user_id,
            "group": group,
            "status_code": 403,
            "tree": tree2.producing_workflow_id,
        },
        {
            "user": user.auth0_user_id,
            "group": group,
            "status_code": 400,
            "tree": tree2.producing_workflow_id,
        },
    ]
    for case in cases:
        print(case)
        auth_headers = {"user_id": str(case["user"])}
        # We want to be able to fetch the tree that belongs to `group`
        res = await http_client.delete(
            f"/v2/orgs/{case['group'].id}/phylo_runs/{case['tree']}",
            headers=auth_headers,
        )
        assert res.status_code == case["status_code"]
        if case["status_code"] == 200:
            response = res.json()
            assert response == {"id": case["tree"]}
