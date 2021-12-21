from typing import List, Tuple

import pytest
import sqlalchemy as sa
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.database.models import Group, PhyloRun, PhyloTree, Sample, User
from aspen.test_infra.models.phylo_tree import phylorun_factory, phylotree_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.usergroup import group_factory, user_factory

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


async def make_shared_test_data(
    async_session: AsyncSession,
) -> Tuple[User, Group, List[Sample], PhyloRun, PhyloTree]:
    group = group_factory()
    user = user_factory(group)
    samples = [
        sample_factory(
            group,
            user,
            private_identifier=f"private_identifier_{i}",
            public_identifier=f"public_identifier_{i}",
        )
        for i in range(1, 3)
    ]
    phylo_run = phylorun_factory(group)
    phylo_tree = phylotree_factory(phylo_run, samples)
    async_session.add(group)
    async_session.add(user)
    async_session.add_all(samples)
    async_session.add(phylo_run)
    async_session.add(phylo_tree)

    await async_session.commit()

    return user, group, samples, phylo_run, phylo_tree


async def test_update_phylo_tree(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    user, group, samples, phylo_run, phylo_tree = await make_shared_test_data(
        async_session
    )
    auth_headers = {"user_id": user.auth0_user_id}
    data = {"id": phylo_run.id, "name": "new_name"}
    res = await http_client.put("/v2/phylo_trees/", json=data, headers=auth_headers)

    assert res.status_code == 200

    phylo_tree_updated_q = await async_session.execute(
        sa.select(PhyloTree).filter(PhyloTree.id == phylo_tree.id)
    )
    phylo_tree_result = phylo_tree_updated_q.scalars().one()
    assert phylo_tree_result.name == data["name"]


async def test_update_phylo_tree_wrong_group(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    (
        user_that_made_tree,
        group_that_made_tree,
        samples,
        phylo_run,
        phylo_tree,
    ) = await make_shared_test_data(async_session)
    group_that_did_not_make_tree = group_factory(name="i want to see trees")
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
    data = {"id": phylo_run.id, "name": "new_name"}
    res = await http_client.put("/v2/phylo_trees/", json=data, headers=auth_headers)

    assert res.status_code == 400
    assert (
        res.content
        == b'{"error":"User trying_to_see from group i want to see trees does not have pemission to update tree name"}'
    )
