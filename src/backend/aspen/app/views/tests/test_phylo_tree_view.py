import json
import random
from typing import Collection, List, Mapping, Tuple, Union

from flask.testing import FlaskClient

from aspen.app.views.phylo_trees import PHYLO_TREE_KEY
from aspen.database.models import (
    CanSee,
    DataType,
    Group,
    PhyloTree,
    Sample,
    UploadedPathogenGenome,
    User,
)
from aspen.test_infra.models.phylo_tree import phylorun_factory, phylotree_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_factory
from aspen.test_infra.models.usergroup import group_factory, user_factory


def make_sample_data(group: Group, n_samples: int) -> Collection[Sample]:
    samples: Collection[Sample] = [
        sample_factory(
            group,
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
) -> Collection[PhyloTree]:
    # make up to n trees, each with a random sample of uploaded pathogen genomes.
    return [
        phylotree_factory(
            phylorun_factory(group),
            random.sample(samples, k=random.randint(0, len(samples))),
            key=f"key_{ix}",
        )
        for ix in range(n_trees)
    ]


def make_all_test_data(
    group: Group, n_samples: int, n_trees: int
) -> Tuple[
    Collection[Sample], Collection[UploadedPathogenGenome], Collection[PhyloTree]
]:
    samples: Collection[Sample] = make_sample_data(group, n_samples)
    uploaded_pathogen_genomes: Collection[
        UploadedPathogenGenome
    ] = make_uploaded_pathogen_genomes(samples)
    trees: Collection[PhyloTree] = make_trees(group, samples, n_trees)
    return samples, uploaded_pathogen_genomes, trees


def check_results(client: FlaskClient, user: User, trees: Collection[PhyloTree]):
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

        assert result_tree["pathogen_genome_count"] == len(tree.constituent_samples)


def test_phylo_tree_view(
    session,
    app,
    client,
    n_samples=5,
    n_trees=3,
):
    group: Group = group_factory()
    user: User = user_factory(group)
    samples, _, trees = make_all_test_data(group, n_samples, n_trees)

    session.add(group)
    session.commit()

    check_results(client, user, trees)


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
    samples, _, trees = make_all_test_data(owner_group, n_samples, n_trees)

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
    samples, _, trees = make_all_test_data(owner_group, n_samples, n_trees)

    session.add_all((owner_group, viewer_group))
    session.commit()

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    results = json.loads(client.get("/api/phylo_trees").get_data(as_text=True))

    assert len(results[PHYLO_TREE_KEY]) == 0
