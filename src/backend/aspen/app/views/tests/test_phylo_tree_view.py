import json
import random
from typing import Collection, List, Mapping, Sequence, Tuple, Union

from aspen.app.views.phylo_trees import PHYLO_TREE_KEY
from aspen.database.models import (
    CanSee,
    DataType,
    Group,
    PhyloRun,
    PhyloTree,
    Sample,
    UploadedPathogenGenome,
    User,
    WorkflowStatusType,
)
from aspen.test_infra.models.phylo_tree import phylorun_factory, phylotree_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_factory
from aspen.test_infra.models.usergroup import group_factory, user_factory


def make_sample_data(group: Group, user: User, n_samples: int) -> Collection[Sample]:
    samples: Collection[Sample] = [
        sample_factory(
            group,
            user,
            public_identifier=f"public_identifier_{ix}",
            private_identifier=f"private_identifier_{ix}",
        )
        for ix in range(n_samples)
    ]
    return samples


def make_uploaded_pathogen_genomes(
    samples: Collection[Sample],
) -> Collection[UploadedPathogenGenome]:
    return [
        uploaded_pathogen_genome_factory(sample, accessions=()) for sample in samples
    ]


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
    group: Group, user: User, n_samples: int, n_trees: int
) -> Tuple[
    Collection[Sample],
    Collection[UploadedPathogenGenome],
    Sequence[PhyloTree],
    Collection[PhyloRun],
]:
    samples: Collection[Sample] = make_sample_data(group, user, n_samples)
    uploaded_pathogen_genomes: Collection[
        UploadedPathogenGenome
    ] = make_uploaded_pathogen_genomes(samples)
    trees: Sequence[PhyloTree] = make_trees(group, samples, n_trees)
    treeless_runs: Collection[PhyloRun] = make_runs_with_no_trees(group)
    return samples, uploaded_pathogen_genomes, trees, treeless_runs


def check_results(client, user: User, trees: Collection[PhyloTree]):
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    results: Mapping[str, List[Mapping[str, Union[str, int]]]] = json.loads(
        client.get("/api/phylo_trees").get_data(as_text=True)
    )

    for tree in trees:
        for result_tree in results[PHYLO_TREE_KEY]:
            if tree.entity_id == result_tree["phylo_tree_id"]:
                # found it!
                break
        else:
            raise ValueError(f"Could not find {tree} in results")

        assert result_tree["pathogen_genome_count"] == 0


def test_phylo_tree_view(
    session,
    app,
    client,
    n_samples=5,
    n_trees=3,
):
    group: Group = group_factory()
    user: User = user_factory(group)
    _, _, trees, _ = make_all_test_data(group, user, n_samples, n_trees)

    session.add(group)
    session.commit()

    check_results(client, user, trees)


def test_in_progress_and_failed_trees(
    session,
    app,
    client,
    n_samples=5,
    n_trees=3,
):
    group: Group = group_factory()
    user: User = user_factory(group)
    _, _, _, treeless_runs = make_all_test_data(group, user, n_samples, n_trees)

    session.add(group)
    session.commit()

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    results: Mapping[str, List[Mapping[str, Union[str, int]]]] = json.loads(
        client.get("/api/phylo_trees").get_data(as_text=True)
    )

    results_trees = results[PHYLO_TREE_KEY]
    results_incomplete_trees = [
        tree
        for tree in results_trees
        if tree["status"] != WorkflowStatusType.COMPLETED.value
    ]
    assert len(results_incomplete_trees) == len(treeless_runs)
    for incomplete in results_incomplete_trees:
        assert incomplete["phylo_tree_id"] is None
        assert incomplete["name"] is not None
    assert (
        len(
            [
                tree
                for tree in results_incomplete_trees
                if tree["status"] == WorkflowStatusType.STARTED.value
            ]
        )
        == 1
    )
    assert (
        len(
            [
                tree
                for tree in results_incomplete_trees
                if tree["status"] == WorkflowStatusType.FAILED.value
            ]
        )
        == 1
    )


def test_phylo_trees_can_see(
    session,
    app,
    client,
    n_samples=5,
    n_trees=3,
):
    owner_group: Group = group_factory()
    viewer_group: Group = group_factory("CADPH")
    user: User = user_factory(viewer_group)
    _, _, trees, _ = make_all_test_data(owner_group, user, n_samples, n_trees)

    CanSee(viewer_group=viewer_group, owner_group=owner_group, data_type=DataType.TREES)
    session.add_all((owner_group, viewer_group))
    session.commit()

    check_results(client, user, trees)


def test_phylo_trees_no_can_see(
    session,
    app,
    client,
    n_samples=5,
    n_trees=3,
):
    owner_group: Group = group_factory()
    viewer_group: Group = group_factory("CADPH")
    user: User = user_factory(viewer_group)
    _, _, trees, _ = make_all_test_data(owner_group, user, n_samples, n_trees)

    session.add_all((owner_group, viewer_group))
    session.commit()

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    results = json.loads(client.get("/api/phylo_trees").get_data(as_text=True))

    assert len(results[PHYLO_TREE_KEY]) == 0


def test_phylo_trees_admin(
    session,
    app,
    client,
    n_samples=5,
    n_trees=3,
):
    owner_group: Group = group_factory()
    viewer_group: Group = group_factory("admin")
    user: User = user_factory(viewer_group, system_admin=True)
    _, _, trees, _ = make_all_test_data(owner_group, user, n_samples, n_trees)

    session.add_all((owner_group, viewer_group))
    session.commit()

    check_results(client, user, trees)


def test_phylo_tree_can_see(
    mock_s3_resource,
    test_data_dir,
    session,
    app,
    client,
    n_samples=5,
    n_trees=1,
):
    owner_group: Group = group_factory()
    viewer_group: Group = group_factory("CADPH")
    user: User = user_factory(viewer_group)
    _, _, trees, _ = make_all_test_data(owner_group, user, n_samples, n_trees)

    # We need to create the bucket since this is all in Moto's 'virtual' AWS account
    phylo_tree = trees[0]  # we only have one
    mock_s3_resource.create_bucket(Bucket=phylo_tree.s3_bucket)

    json_test_file = test_data_dir / "ncov_aspen.json"
    with json_test_file.open() as fh:
        test_json = json.dumps(json.load(fh))

    mock_s3_resource.Bucket(phylo_tree.s3_bucket).Object(phylo_tree.s3_key).put(
        Body=test_json
    )

    CanSee(viewer_group=viewer_group, owner_group=owner_group, data_type=DataType.TREES)
    session.add_all((owner_group, viewer_group))
    session.commit()

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    results = json.loads(
        client.get(f"/api/phylo_tree/{trees[0].id}").get_data(as_text=True)
    )
    assert results == json.loads(test_json)


def test_phylo_tree_no_can_see(
    mock_s3_resource,
    test_data_dir,
    session,
    app,
    client,
    n_samples=5,
    n_trees=1,
):
    owner_group: Group = group_factory()
    viewer_group: Group = group_factory("CADPH")
    user: User = user_factory(viewer_group)
    _, _, trees, _ = make_all_test_data(owner_group, user, n_samples, n_trees)

    # We need to create the bucket since this is all in Moto's 'virtual' AWS account
    phylo_tree = trees[0]  # we only have one
    mock_s3_resource.create_bucket(Bucket=phylo_tree.s3_bucket)

    json_test_file = test_data_dir / "ncov_aspen.json"
    with json_test_file.open() as fh:
        test_json = json.dumps(json.load(fh))

    mock_s3_resource.Bucket(phylo_tree.s3_bucket).Object(phylo_tree.s3_key).put(
        Body=test_json
    )

    session.add_all((owner_group, viewer_group))
    session.commit()

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    results = client.get(f"/api/phylo_tree/{trees[0].id}").get_data(as_text=True)
    assert (
        results
        == f"PhyloTree with id {phylo_tree.id} not viewable by user with id: {user.id}"
    )


def test_phylo_tree_admin(
    mock_s3_resource,
    test_data_dir,
    session,
    app,
    client,
    n_samples=5,
    n_trees=1,
):
    owner_group: Group = group_factory()
    viewer_group: Group = group_factory("admin")
    user: User = user_factory(viewer_group, system_admin=True)
    _, _, trees, _ = make_all_test_data(owner_group, user, n_samples, n_trees)

    # We need to create the bucket since this is all in Moto's 'virtual' AWS account
    phylo_tree = trees[0]  # we only have one
    mock_s3_resource.create_bucket(Bucket=phylo_tree.s3_bucket)

    json_test_file = test_data_dir / "ncov_aspen.json"
    with json_test_file.open() as fh:
        test_json = json.dumps(json.load(fh))

    mock_s3_resource.Bucket(phylo_tree.s3_bucket).Object(phylo_tree.s3_key).put(
        Body=test_json
    )

    session.add_all((owner_group, viewer_group))
    session.commit()

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    # Don't check the tree data because the constituent samples for each tree is random,
    # and as such, the remap to private identifiers is not deterministic.
    json.loads(client.get(f"/api/phylo_tree/{trees[0].id}").get_data(as_text=True))
