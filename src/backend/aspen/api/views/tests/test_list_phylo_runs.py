import random
from typing import Collection, Sequence, Tuple

import pytest

from aspen.database.models import (
    CanSee,
    DataType,
    Group,
    Location,
    PhyloRun,
    PhyloTree,
    Sample,
    UploadedPathogenGenome,
    User,
    WorkflowStatusType,
)
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.phylo_tree import phylorun_factory, phylotree_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_factory
from aspen.test_infra.models.usergroup import group_factory, user_factory

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


def make_sample_data(
    group: Group, user: User, location: Location, n_samples: int
) -> Collection[Sample]:
    samples: Collection[Sample] = [
        sample_factory(
            group,
            user,
            location,
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
    group: Group, samples: Collection[Sample], n_trees: int
) -> Sequence[PhyloTree]:
    # make up to n trees, each with a random sample of uploaded pathogen genomes.
    return [
        phylotree_factory(
            phylorun_factory(group),
            random.sample(samples, k=random.randint(0, len(samples))),  # type: ignore
            key=f"key_{ix}",
        )  # type: ignore
        for ix in range(n_trees)
    ]


def make_runs_with_no_trees(group: Group) -> Collection[PhyloRun]:
    # Make an in-progress run and a failed run.
    other_statuses = [WorkflowStatusType.STARTED, WorkflowStatusType.FAILED]
    template_args = {
        "division": group.division,
        "location": group.location,
    }
    return [
        phylorun_factory(group, workflow_status=status, template_args=template_args)
        for status in other_statuses
    ]


def make_all_test_data(
    group: Group, user: User, location: Location, n_samples: int, n_trees: int
) -> Tuple[
    Collection[Sample],
    Collection[UploadedPathogenGenome],
    Sequence[PhyloTree],
    Collection[PhyloRun],
]:
    samples: Collection[Sample] = make_sample_data(group, user, location, n_samples)
    uploaded_pathogen_genomes: Collection[
        UploadedPathogenGenome
    ] = make_uploaded_pathogen_genomes(samples)
    trees: Sequence[PhyloTree] = make_trees(group, samples, n_trees)
    treeless_runs: Collection[PhyloRun] = make_runs_with_no_trees(group)
    return samples, uploaded_pathogen_genomes, trees, treeless_runs


async def check_results(http_client, user: User, trees: Collection[PhyloTree]):
    auth_headers = {"user_id": str(user.auth0_user_id)}
    res = await http_client.get("/v2/phylo_runs/", headers=auth_headers)
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
    user: User = user_factory(group)
    location: Location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    _, _, trees, _ = make_all_test_data(group, user, location, n_samples, n_trees)

    async_session.add(group)
    await async_session.commit()

    await check_results(http_client, user, trees)


async def test_in_progress_and_failed_trees(
    async_session,
    http_client,
    n_samples=5,
    n_trees=3,
):
    group: Group = group_factory()
    user: User = user_factory(group)
    location: Location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    _, _, _, treeless_runs = make_all_test_data(
        group, user, location, n_samples, n_trees
    )

    async_session.add(group)
    await async_session.commit()

    auth_headers = {"user_id": str(user.auth0_user_id)}
    res = await http_client.get("/v2/phylo_runs/", headers=auth_headers)
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
    user: User = user_factory(viewer_group)
    location: Location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    _, _, trees, _ = make_all_test_data(owner_group, user, location, n_samples, n_trees)

    CanSee(viewer_group=viewer_group, owner_group=owner_group, data_type=DataType.TREES)
    async_session.add_all((owner_group, viewer_group))
    await async_session.commit()

    await check_results(http_client, user, trees)


async def test_phylo_trees_no_can_see(
    async_session,
    http_client,
    n_samples=5,
    n_trees=3,
):
    owner_group: Group = group_factory()
    viewer_group: Group = group_factory("CADPH")
    user: User = user_factory(viewer_group)
    location: Location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    _, _, trees, _ = make_all_test_data(owner_group, user, location, n_samples, n_trees)

    async_session.add_all((owner_group, viewer_group))
    await async_session.commit()

    auth_headers = {"user_id": str(user.auth0_user_id)}
    res = await http_client.get("/v2/phylo_runs/", headers=auth_headers)
    results = res.json()["phylo_runs"]

    assert len(results) == 0


async def test_phylo_trees_admin(
    async_session,
    http_client,
    n_samples=5,
    n_trees=3,
):
    owner_group: Group = group_factory()
    viewer_group: Group = group_factory("admin")
    user: User = user_factory(viewer_group, system_admin=True)
    location: Location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    _, _, trees, _ = make_all_test_data(owner_group, user, location, n_samples, n_trees)

    async_session.add_all((owner_group, viewer_group))
    await async_session.commit()

    await check_results(http_client, user, trees)
