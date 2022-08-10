from typing import List, Tuple, Union

import pytest
import sqlalchemy as sa
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.database.models import Group, PhyloRun, PhyloTree, Sample, User
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.phylo_tree import phylorun_factory, phylotree_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.usergroup import group_factory, userrole_factory

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


async def make_shared_test_data(
    async_session: AsyncSession, no_trees: bool = False, system_admin=False
) -> Tuple[User, Group, List[Sample], PhyloRun, Union[PhyloTree, None]]:
    location = location_factory(
        "North America",
        "USA",
        "California",
        "Santa Barbara County",
        34.7136533,
        -119.9858232,
    )
    group = group_factory(default_tree_location=location)
    user = await userrole_factory(async_session, group, system_admin=system_admin)
    samples = [
        sample_factory(
            group,
            user,
            location,
            private_identifier=f"private_identifier_{i}",
            public_identifier=f"public_identifier_{i}",
        )
        for i in range(1, 3)
    ]
    phylo_run = phylorun_factory(group)
    phylo_tree = None
    if not no_trees:
        phylo_tree = phylotree_factory(phylo_run, samples)
        async_session.add(phylo_tree)

    async_session.add(group)
    async_session.add(user)
    async_session.add_all(samples)
    async_session.add(phylo_run)

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
    data = {"name": "new_name"}
    res = await http_client.put(
        f"/v2/orgs/{group.id}/phylo_runs/{phylo_run.id}",
        json=data,
        headers=auth_headers,
    )

    assert res.status_code == 200

    phylo_tree_updated_q = await async_session.execute(
        sa.select(PhyloTree).filter(PhyloTree.id == phylo_tree.id)  # type: ignore
    )
    phylo_run_updated_q = await async_session.execute(
        sa.select(PhyloRun).filter(PhyloRun.id == phylo_run.id)  # type: ignore
    )
    phylo_tree_result = phylo_tree_updated_q.scalars().one()
    phylo_run_result = phylo_run_updated_q.scalars().one()

    # both phylotree and phylorun name field should be changed
    assert phylo_tree_result.name == data["name"]
    assert phylo_run_result.name == data["name"]


async def test_update_phylo_run_no_trees(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    user, group, samples, phylo_run, _ = await make_shared_test_data(
        async_session, no_trees=True
    )
    auth_headers = {"user_id": user.auth0_user_id}
    data = {"name": "new_name"}
    res = await http_client.put(
        f"/v2/orgs/{group.id}/phylo_runs/{phylo_run.id}",
        json=data,
        headers=auth_headers,
    )

    assert res.status_code == 200

    phylo_run_updated_q = await async_session.execute(
        sa.select(PhyloRun).filter(PhyloRun.id == phylo_run.id)  # type: ignore
    )
    phylo_run_result = phylo_run_updated_q.scalars().one()

    # check phylorun name field is changed
    assert phylo_run_result.name == data["name"]


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
    data = {"name": "new_name"}
    res = await http_client.put(
        f"/v2/orgs/{group_that_did_not_make_tree.id}/phylo_runs/{phylo_run.id}",
        json=data,
        headers=auth_headers,
    )

    assert res.status_code == 404
    assert res.content == b'{"error":"phylo run not found"}'
