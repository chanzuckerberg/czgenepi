from typing import List, Tuple, Union
from pkg_resources import require

from aspen.api.authz import get_authz_session, AuthZSession

import pytest
import sqlalchemy as sa
from aspen.test_infra.models.usergroup import grouprole_factory
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.api.authn import setup_userinfo, require_group_membership, get_auth_context
from aspen.database.models import Group, PhyloRun, PhyloTree, Sample, User
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.phylo_tree import phylorun_factory, phylotree_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.usergroup import group_factory, userrole_factory

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio

# Our user/group graph for these tests looks like this:
# User1 -- member --> Group1
# User2 -- member --> Group2 -- viewer --> Group3
#                        +----- viewer --> Group4
# User3 -- admin  --> Group3 -- member --> Group4 # We don't expect this use case right now, but let's make sure it works.
# User4 -- admin  --> Group4 -- viewer --> Group3

@pytest.fixture
async def groups(async_session: AsyncSession) -> List[Group]:
    group1 = group_factory(name="Group1")
    group2 = group_factory(name="Group2")
    group3 = group_factory(name="Group3")
    group4 = group_factory(name="Group4")
    groups: List[Group] = [group1, group2, group3, group4]

    group_roles = []
    group_roles.extend(await grouprole_factory(async_session, group2, group3))
    group_roles.extend(await grouprole_factory(async_session, group2, group4))
    group_roles.extend(await grouprole_factory(async_session, group3, group4, role_name="member"))
    group_roles.extend(await grouprole_factory(async_session, group4, group3))

    async_session.add_all(group_roles)
    async_session.add_all(groups)
    await async_session.commit()
    return groups

@pytest.fixture
async def users(async_session: AsyncSession, groups: List[Group]) -> List[User]:
    user1 = await userrole_factory(async_session, groups[0], roles=["member"], email="user1@czgenepi.org", auth0_user_id="User1")
    user2 = await userrole_factory(async_session, groups[1], roles=["member"], email="user2@czgenepi.org", auth0_user_id="User2")
    user3 = await userrole_factory(async_session, groups[2], roles=["admin"], email="user3@czgenepi.org", auth0_user_id="User3")
    user4 = await userrole_factory(async_session, groups[3], roles=["admin"], email="user4@czgenepi.org", auth0_user_id="User4")
    users: List[User] = [user1, user2, user3, user4]
    async_session.add_all(users)
    await async_session.commit()
    return users

@pytest.fixture
async def appdata(async_session: AsyncSession, groups: List[Group], users: List[User]) -> List[PhyloTree]:
    location = location_factory("North America", "USA", "California", "Santa Barbara County")

    # Put 3 few samples, trees, runs in each group.
    objects_to_commit = []
    trees: List[PhyloTree] = []
    for i in range(len(groups)):
        group = groups[i]
        user = users[i]
        # NOTE - this is horribly abusing python and adding arbitrary test data to our group models.
        group.test_samples = []
        group.test_runs = []
        group.test_trees = []
        for i in range(3):
            private = (i >= 2) # Sample 3 is private
            sample = sample_factory(
                group,
                user,
                location,
                private=private,
                private_identifier=f"private_identifier_{group.name}_{i}",
                public_identifier=f"public_identifier_{group.name}_{i}",
            )
            phylo_run = phylorun_factory(group)
            tree = phylotree_factory(phylo_run, sample)

            group.test_samples.append(sample)
            group.test_runs.append(phylo_run)
            group.test_runs.append(tree)
            trees.append(tree)
            objects_to_commit.extend([sample, phylo_run, tree])

    async_session.add_all(objects_to_commit)
    await async_session.commit()
    return trees

async def make_authcontext(async_session: AsyncSession, group: Group, user: User):
    auth_user = await setup_userinfo(async_session, user.auth0_user_id)
    user_roles = await require_group_membership(group.id, auth_user, async_session)
    authcontext = await get_auth_context(group.id, user, async_session, user_roles)
    authzsession = await get_authz_session(authcontext, async_session)
    return authzsession

@pytest.fixture
async def azs(
    async_session: AsyncSession,
    groups: List[Group], users: List[User], appdata: List[PhyloTree],
):
    sessions = []
    for i in range(len(users)):
        user = users[i]
        group = groups[i]
        sessions.append(await make_authcontext(async_session, group, user))
    
async def test_sample_access(
    async_session: AsyncSession,
    groups: List[Group], users: List[User], appdata: List[PhyloTree], azs: List[AuthZSession]
, test_sessions: List[AuthZSession]):
   # Make sure each group can see the appropriate samples
   matrix = [
    {"user_idx": 0, "read_samples": groups[0].test_samples},
   ]
   for case in matrix:
    i = case["user_idx"]
    expected_samples = [sample.id for sample in case["read_samples"]]
    results = (await async_session.execute(await azs[i].authorized_query("read", Sample))).scalars().all()
    actual_samples = [sample.id for sample in results]
    assert actual_samples == expected_samples


