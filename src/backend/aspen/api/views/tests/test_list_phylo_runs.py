import random
from typing import Collection, Sequence, Tuple

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.database.models import (
    Group,
    Location,
    Pathogen,
    PhyloRun,
    PhyloTree,
    Sample,
    UploadedPathogenGenome,
    User,
    WorkflowStatusType,
)
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.pathogen import random_pathogen_factory
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


def make_sample_data(
    group: Group, user: User, location: Location, n_samples: int, pathogen: Pathogen
) -> Collection[Sample]:
    samples: Collection[Sample] = [
        sample_factory(
            group,
            user,
            location,
            pathogen=pathogen,
            public_identifier=f"public_identifier_{ix}",
            private_identifier=f"private_identifier_{ix}",
        )
        for ix in range(n_samples)
    ]
    return samples


def make_uploaded_pathogen_genomes(
    samples: Collection[Sample],
) -> Collection[UploadedPathogenGenome]:
    return [uploaded_pathogen_genome_factory(sample) for sample in samples]


def make_trees(
    group: Group, pathogen: Pathogen, samples: Collection[Sample], n_trees: int
) -> Sequence[PhyloTree]:
    # make up to n trees, each with a random sample of uploaded pathogen genomes.
    return [
        phylotree_factory(
            phylorun_factory(group, pathogen=pathogen),
            random.sample(samples, k=random.randint(0, len(samples))),  # type: ignore
            key=f"key_{ix}",
        )  # type: ignore
        for ix in range(n_trees)
    ]


def make_runs_with_no_trees(group: Group, pathogen: Pathogen) -> Collection[PhyloRun]:
    # Make an in-progress run and a failed run.
    other_statuses = [WorkflowStatusType.STARTED, WorkflowStatusType.FAILED]
    template_args = {
        "division": group.division,
        "location": group.location,
    }
    return [
        phylorun_factory(
            group,
            workflow_status=status,
            template_args=template_args,
            pathogen=pathogen,
        )
        for status in other_statuses
    ]


def make_all_test_data(
    async_session: AsyncSession,
    group: Group,
    user: User,
    location: Location,
    n_samples: int,
    n_trees: int,
) -> Tuple[
    Pathogen,
    Collection[Sample],
    Collection[UploadedPathogenGenome],
    Sequence[PhyloTree],
    Collection[PhyloRun],
]:
    pathogen: Pathogen = random_pathogen_factory()
    setup_gisaid_and_genbank_repo_configs(async_session, pathogen)

    samples: Collection[Sample] = make_sample_data(
        group, user, location, n_samples, pathogen
    )
    uploaded_pathogen_genomes: Collection[
        UploadedPathogenGenome
    ] = make_uploaded_pathogen_genomes(samples)

    trees: Sequence[PhyloTree] = make_trees(group, pathogen, samples, n_trees)
    treeless_runs: Collection[PhyloRun] = make_runs_with_no_trees(group, pathogen)
    return pathogen, samples, uploaded_pathogen_genomes, trees, treeless_runs


async def check_results(
    http_client,
    user: User,
    group: Group,
    pathogen: Pathogen,
    trees: Collection[PhyloTree],
):
    auth_headers = {"user_id": str(user.auth0_user_id)}
    res = await http_client.get(
        f"/v2/orgs/{group.id}/pathogens/{pathogen.slug}/phylo_runs/",
        headers=auth_headers,
    )
    results = res.json()["phylo_runs"]

    for tree in trees:
        for result_tree in results:
            if tree.entity_id == result_tree["phylo_tree"]["id"]:
                # found it!
                break
        else:
            raise ValueError(f"Could not find {tree} in results")


async def test_phylo_tree_view(
    async_session,
    http_client,
    n_samples=5,
    n_trees=3,
):
    group: Group = group_factory()
    user: User = await userrole_factory(async_session, group)
    location: Location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    pathogen, _, _, trees, _ = make_all_test_data(
        async_session, group, user, location, n_samples, n_trees
    )

    async_session.add(group)
    await async_session.commit()

    await check_results(http_client, user, group, pathogen, trees)


async def test_in_progress_and_failed_trees(
    async_session,
    http_client,
    n_samples=5,
    n_trees=3,
):
    group: Group = group_factory()
    user: User = await userrole_factory(async_session, group)
    location: Location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    pathogen, _, _, trees, treeless_runs = make_all_test_data(
        async_session, group, user, location, n_samples, n_trees
    )

    async_session.add(group)
    await async_session.commit()

    auth_headers = {"user_id": str(user.auth0_user_id)}
    res = await http_client.get(
        f"/v2/orgs/{group.id}/pathogens/{pathogen.slug}/phylo_runs/",
        headers=auth_headers,
    )
    results = res.json()["phylo_runs"]

    results_incomplete_trees = [
        tree
        for tree in results
        if tree["workflow_status"] != WorkflowStatusType.COMPLETED.value
    ]
    assert len(results_incomplete_trees) == len(treeless_runs)
    for incomplete in results_incomplete_trees:
        assert incomplete["phylo_tree"] is None
        assert incomplete["name"] is not None
    assert (
        len(
            [
                tree
                for tree in results_incomplete_trees
                if tree["workflow_status"] == WorkflowStatusType.STARTED.value
            ]
        )
        == 1
    )
    assert (
        len(
            [
                tree
                for tree in results_incomplete_trees
                if tree["workflow_status"] == WorkflowStatusType.FAILED.value
            ]
        )
        == 1
    )


async def test_phylo_trees_can_see(
    async_session,
    http_client,
    n_samples=5,
    n_trees=3,
):
    owner_group: Group = group_factory()
    viewer_group: Group = group_factory("CADPH")
    user: User = await userrole_factory(async_session, viewer_group)
    location: Location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    pathogen, _, _, trees, _ = make_all_test_data(
        async_session, owner_group, user, location, n_samples, n_trees
    )

    role_objs = await grouprole_factory(async_session, owner_group, viewer_group)
    async_session.add_all(role_objs)
    await async_session.commit()

    await check_results(http_client, user, viewer_group, pathogen, trees)


async def test_phylo_trees_no_can_see(
    async_session,
    http_client,
    n_samples=5,
    n_trees=3,
):
    owner_group: Group = group_factory()
    viewer_group: Group = group_factory("CADPH")
    user: User = await userrole_factory(async_session, viewer_group)
    location: Location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    pathogen, _, _, trees, _ = make_all_test_data(
        async_session, owner_group, user, location, n_samples, n_trees
    )

    async_session.add_all((owner_group, viewer_group))
    await async_session.commit()

    auth_headers = {"user_id": str(user.auth0_user_id)}
    res = await http_client.get(
        f"/v2/orgs/{owner_group.id}/pathogens/{pathogen.slug}/phylo_runs/",
        headers=auth_headers,
    )
    assert res.status_code == 403
