from typing import Any, List

import pytest
import pytest_asyncio
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from aspen.api.authn import get_auth_context, get_user_roles, setup_userinfo
from aspen.api.authz import AuthZSession, get_authz_session
from aspen.database.models import Group, GroupRole, PhyloRun, PhyloTree, Sample, User
from aspen.database.models.base import idbase
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.pathogen import pathogen_factory
from aspen.test_infra.models.phylo_tree import phylorun_factory, phylotree_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.repository import random_repo_factory
from aspen.test_infra.models.usergroup import (
    group_factory,
    grouprole_factory,
    userrole_factory,
)

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio

# Our user/group graph for these tests looks like this:
# User0 -- member --> Group0
# User1 -- member --> Group1 -- viewer --> Group2
#                        +----- viewer --> Group3
# User2 -- admin  --> Group2 -- member --> Group3 # We don't expect this use case right now, but let's make sure it works.
# User3 -- admin  --> Group3 -- viewer --> Group2


@pytest_asyncio.fixture
async def groups(async_session: AsyncSession) -> List[Group]:
    group0 = group_factory(name="Group0")
    group1 = group_factory(name="Group1")
    group2 = group_factory(name="Group2")
    group3 = group_factory(name="Group3")
    groups: List[Group] = [group0, group1, group2, group3]

    group_roles = []
    group_roles.extend(await grouprole_factory(async_session, group2, group1))
    group_roles.extend(await grouprole_factory(async_session, group3, group1))
    group_roles.extend(
        await grouprole_factory(async_session, group3, group2, role_name="member")
    )
    group_roles.extend(await grouprole_factory(async_session, group2, group3))

    async_session.add_all(groups + group_roles)
    await async_session.commit()
    return groups


@pytest_asyncio.fixture
async def users(async_session: AsyncSession, groups: List[Group]) -> List[User]:
    user0 = await userrole_factory(
        async_session,
        groups[0],
        roles=["member"],
        email="user0@czgenepi.org",
        auth0_user_id="User0",
    )
    user1 = await userrole_factory(
        async_session,
        groups[1],
        roles=["member"],
        email="user1@czgenepi.org",
        auth0_user_id="User1",
    )
    user2 = await userrole_factory(
        async_session,
        groups[2],
        roles=["admin"],
        email="user2@czgenepi.org",
        auth0_user_id="User2",
    )
    user3 = await userrole_factory(
        async_session,
        groups[3],
        roles=["admin"],
        email="user3@czgenepi.org",
        auth0_user_id="User3",
    )
    users: List[User] = [user0, user1, user2, user3]
    async_session.add_all(users)
    await async_session.commit()
    return users


@pytest_asyncio.fixture
async def appdata(
    async_session: AsyncSession, groups: List[Group], users: List[User]
) -> List[PhyloTree]:
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )

    # Put 3 samples, trees, runs in each group.
    objects_to_commit = []
    trees: List[PhyloTree] = []
    pathogen = pathogen_factory()
    repo = random_repo_factory()
    for i in range(len(groups)):
        group = groups[i]
        user = users[i]
        # NOTE - this is horribly abusing python and adding arbitrary test data to our group models.
        group.test_samples = []
        group.test_runs = []
        group.test_trees = []
        for i in range(3):
            private = i >= 2  # Sample 3 is private
            sample = sample_factory(
                group,
                user,
                location,
                pathogen=pathogen,
                private=private,
                private_identifier=f"private_identifier_{group.name}_{i}",
                public_identifier=f"public_identifier_{group.name}_{i}",
            )
            phylo_run = phylorun_factory(group, pathogen=pathogen, contextual_repository=repo)
            tree = phylotree_factory(phylo_run, [sample])

            group.test_samples.append(sample)
            group.test_runs.append(phylo_run)
            group.test_trees.append(tree)
            trees.append(tree)
            objects_to_commit.extend([sample, phylo_run, tree])

    async_session.add_all(objects_to_commit)
    await async_session.commit()
    return trees


async def make_authcontext(async_session: AsyncSession, group: Group, user: User):
    auth_user = await setup_userinfo(async_session, user.auth0_user_id)
    if not auth_user:
        raise Exception("could not find user")
    user_roles = await get_user_roles(group.id, auth_user, async_session)
    authcontext = await get_auth_context(group.id, user, async_session, user_roles)
    authzsession = await get_authz_session(authcontext, async_session)
    return authzsession


@pytest_asyncio.fixture
async def azs(
    async_session: AsyncSession,
    groups: List[Group],
    users: List[User],
) -> List[AuthZSession]:
    sessions = []
    for i in range(len(users)):
        user = users[i]
        group = groups[i]
        sessions.append(await make_authcontext(async_session, group, user))
    return sessions


# Enable debugging - print more info about users/groups/roles.
async def debug_group_roles(async_session, az):
    ac = az.auth_context
    print(
        f"user {ac.user.auth0_user_id} / group {ac.group.name} / roles {ac.user_roles} / group_roles: {ac.group_roles}"
    )
    group_roles = (
        (
            await async_session.execute(
                sa.select(GroupRole).options(
                    joinedload(GroupRole.grantor_group),
                    joinedload(GroupRole.grantee_group),
                    joinedload(GroupRole.role),
                )
            )
        )
        .scalars()
        .all()
    )
    for gr in group_roles:
        print(f"{gr.grantor_group.name} / {gr.grantee_group.name} / {gr.role.name}")


async def check_matrix(
    model_class: idbase, permission: str, async_session, matrix: List[Any]
):
    for (az, expected) in matrix:
        expected_items = [item.id for item in expected]
        # uncomment below for more debug
        # await debug_group_roles(async_session, az)
        results = (
            (
                await async_session.execute(
                    await az.authorized_query(permission, model_class)
                )
            )
            .scalars()
            .all()
        )
        actual_items = [item.id for item in results]
        assert set(actual_items) == set(expected_items)


async def test_sample_read(
    async_session: AsyncSession,
    groups: List[Group],
    appdata: List[PhyloTree],
    azs: List[AuthZSession],
):
    results = [
        groups[0].test_samples,
        groups[1].test_samples
        + [sample for sample in groups[2].test_samples if sample.private is False]
        + [sample for sample in groups[3].test_samples if sample.private is False],
        groups[2].test_samples + groups[3].test_samples,
        groups[3].test_samples
        + [sample for sample in groups[2].test_samples if sample.private is False],
    ]
    matrix = [[azs[i], results[i]] for i in range(len(results))]
    await check_matrix(Sample, "read", async_session, matrix)


async def test_sample_write(
    async_session: AsyncSession,
    groups: List[Group],
    appdata: List[PhyloTree],
    azs: List[AuthZSession],
):
    results = [
        groups[0].test_samples,
        groups[1].test_samples,
        groups[2].test_samples + groups[3].test_samples,
        groups[3].test_samples,
    ]
    matrix = [[azs[i], results[i]] for i in range(len(results))]
    await check_matrix(Sample, "write", async_session, matrix)
    await check_matrix(Sample, "read_private", async_session, matrix)
    await check_matrix(Sample, "sequences", async_session, matrix)


async def test_phyloruns_read(
    async_session: AsyncSession,
    groups: List[Group],
    appdata: List[PhyloTree],
    azs: List[AuthZSession],
):
    results = [
        groups[0].test_runs,
        groups[1].test_runs + groups[2].test_runs + groups[3].test_runs,
        groups[2].test_runs + groups[3].test_runs,
        groups[3].test_runs + groups[2].test_runs,
    ]
    matrix = [[azs[i], results[i]] for i in range(len(results))]
    await check_matrix(PhyloRun, "read", async_session, matrix)


async def test_phyloruns_write(
    async_session: AsyncSession,
    groups: List[Group],
    appdata: List[PhyloTree],
    azs: List[AuthZSession],
):
    results = [
        groups[0].test_runs,
        groups[1].test_runs,
        groups[2].test_runs + groups[3].test_runs,
        groups[3].test_runs,
    ]
    matrix = [[azs[i], results[i]] for i in range(len(results))]
    await check_matrix(PhyloRun, "write", async_session, matrix)


async def test_phylotrees_read(
    async_session: AsyncSession,
    groups: List[Group],
    appdata: List[PhyloTree],
    azs: List[AuthZSession],
):
    results = [
        groups[0].test_runs,
        groups[1].test_trees + groups[2].test_trees + groups[3].test_trees,
        groups[2].test_trees + groups[3].test_trees,
        groups[3].test_trees + groups[2].test_trees,
    ]
    matrix = [[azs[i], results[i]] for i in range(len(results))]
    await check_matrix(PhyloTree, "read", async_session, matrix)


async def test_phylotrees_write(
    async_session: AsyncSession,
    groups: List[Group],
    appdata: List[PhyloTree],
    azs: List[AuthZSession],
):
    results = [
        groups[0].test_trees,
        groups[1].test_trees,
        groups[2].test_trees + groups[3].test_trees,
        groups[3].test_trees,
    ]
    matrix = [[azs[i], results[i]] for i in range(len(results))]
    await check_matrix(PhyloTree, "write", async_session, matrix)


async def test_groups_read(
    async_session: AsyncSession,
    groups: List[Group],
    appdata: List[PhyloTree],
    azs: List[AuthZSession],
):
    results = [
        [groups[0]],
        [groups[1]],
        [groups[2], groups[3]],
        [groups[3]],
    ]
    matrix = [[azs[i], results[i]] for i in range(len(results))]
    await check_matrix(Group, "read", async_session, matrix)
    await check_matrix(Group, "create_sample", async_session, matrix)
    await check_matrix(Group, "create_phylorun", async_session, matrix)


async def test_groups_write(
    async_session: AsyncSession,
    groups: List[Group],
    appdata: List[PhyloTree],
    azs: List[AuthZSession],
):
    results = [
        [],
        [],
        [groups[2]],
        [groups[3]],
    ]
    matrix = [[azs[i], results[i]] for i in range(len(results))]
    await check_matrix(Group, "write", async_session, matrix)
