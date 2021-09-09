from aspen.database.models import CanSee, DataType
from aspen.test_infra.models.phylo_tree import phylorun_factory, phylotree_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_factory
from aspen.test_infra.models.usergroup import group_factory, user_factory


def create_phylotree_with_inputs(session, owner_group):
    username = "owner"
    user = user_factory(
        owner_group, name=username, auth0_user_id=username, email=username
    )
    sample = sample_factory(
        owner_group,
        user,
        public_identifier="public_identifier_1",
        private_identifier="private_identifier_1",
    )
    input_entity = uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")

    phylo_run = phylorun_factory(
        owner_group, inputs=[input_entity], gisaid_ids=["public_identifier_2"]
    )
    phylo_tree = phylotree_factory(
        phylo_run,
        [sample],
    )

    session.add_all([phylo_tree])
    session.commit()
    return phylo_tree, phylo_run


def create_phylotree(session):
    owner_group = group_factory()
    user = user_factory(owner_group)
    sample = sample_factory(owner_group, user)
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")

    phylo_tree = phylotree_factory(
        phylorun_factory(owner_group),
        [sample],
    )

    session.add_all([phylo_tree, owner_group, owner_group])
    session.commit()
    return user, phylo_tree


def test_tree_metadata_download(
    session,
    app,
    client,
):
    """
    Test a regular sequence download for a sample submitted by the user's group
    """
    user, tree = create_phylotree(session)

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    res = client.get(f"/api/phylo_tree/sample_ids/{tree.id}")
    expected_filename = f"{tree.id}_sample_ids.tsv"
    expected_document = (
        "Sample Identifier\tSelected\r\n"
        "public_identifier_1	no\r\n"
        "public_identifier_2	no\r\n"
        "public_identifier_3	no\r\n"
        "public_identifier_4	no\r\n"
        "public_identifier_5	no\r\n"
    )
    file_contents = str(res.data, encoding="UTF-8")
    assert file_contents == expected_document
    assert res.status == "200 OK"
    assert res.headers["Content-Type"] == "text/tsv"
    assert (
        res.headers["Content-Disposition"]
        == f"attachment; filename={expected_filename}"
    )


def create_unique_user(group, username):
    user = user_factory(group, name=username, auth0_user_id=username, email=username)
    return user


def test_private_id_matrix(
    session,
    app,
    client,
):
    """
    Test that we use public ids in the fasta file if the requester only has access to the samples
    sequence data but not private ids
    """
    owner_group = group_factory(name="owner_group")
    private_ids_group = group_factory(name="private_ids_group")
    noaccess_group = group_factory(name="noaccess_group")
    viewer_group = group_factory(name="viewer_group")
    viewer_user = create_unique_user(viewer_group, "viewer")
    private_ids_user = create_unique_user(private_ids_group, "private_ids")
    noaccess_user = create_unique_user(noaccess_group, "noaccess")
    phylo_tree, phylo_run = create_phylotree_with_inputs(session, owner_group)
    # give the viewer group access to trees from the owner group
    CanSee(
        viewer_group=viewer_group,
        owner_group=owner_group,
        data_type=DataType.TREES,
    )
    # give the private ids group access to private ids from the owner group
    CanSee(
        viewer_group=private_ids_group,
        owner_group=owner_group,
        data_type=DataType.PRIVATE_IDENTIFIERS,
    )
    CanSee(
        viewer_group=private_ids_group,
        owner_group=owner_group,
        data_type=DataType.TREES,
    )
    session.add_all([noaccess_user, viewer_user, private_ids_user, phylo_tree])
    session.commit()

    matrix = [
        {
            "user": noaccess_user,
            "expected_status": "400 BAD REQUEST",
            "expected_data": f'{{"error":"PhyloTree with id {phylo_tree.id} not viewable by user with id: {noaccess_user.id}"}}\n',
        },
        {
            "user": viewer_user,
            "expected_status": "200 OK",
            "expected_data": (
                "Sample Identifier\tSelected\r\n"
                "public_identifier_1	yes\r\n"
                "public_identifier_2	yes\r\n"
                "public_identifier_3	no\r\n"
                "public_identifier_4	no\r\n"
                "public_identifier_5	no\r\n"
            ),
        },
        {
            "user": private_ids_user,
            "expected_status": "200 OK",
            "expected_data": (
                "Sample Identifier\tSelected\r\n"
                "private_identifier_1	yes\r\n"
                "public_identifier_2	yes\r\n"
                "public_identifier_3	no\r\n"
                "public_identifier_4	no\r\n"
                "public_identifier_5	no\r\n"
            ),
        },
    ]
    for case in matrix:
        user = case["user"]
        with client.session_transaction() as sess:
            sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
        res = client.get(f"/api/phylo_tree/sample_ids/{phylo_tree.id}")
        assert res.status == case["expected_status"]
        file_contents = str(res.data, encoding="UTF-8")
        assert file_contents == case["expected_data"]
