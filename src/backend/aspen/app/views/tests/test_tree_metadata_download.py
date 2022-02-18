import json
import uuid

from botocore.client import ClientError

from aspen.database.models import CanSee, DataType
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.phylo_tree import phylorun_factory, phylotree_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_factory
from aspen.test_infra.models.usergroup import group_factory, user_factory


def upload_s3_file(mock_s3_resource, phylo_tree, samples, gisaid_samples=None):
    # Create the bucket if it doesn't exist in localstack.
    try:
        mock_s3_resource.meta.client.head_bucket(Bucket=phylo_tree.s3_bucket)
    except ClientError:
        # The bucket does not exist or you have no access.
        mock_s3_resource.create_bucket(Bucket=phylo_tree.s3_bucket)

    body = {
        "tree": {
            "name": "root_identifier_1",
            "children": [{"name": sample.public_identifier} for sample in samples],
        }
    }
    if gisaid_samples:
        for gisaid_sample in gisaid_samples:
            body["tree"]["children"].append({"name": gisaid_sample})
    test_json = json.dumps(body)

    mock_s3_resource.Bucket(phylo_tree.s3_bucket).Object(phylo_tree.s3_key).put(
        Body=test_json
    )


def create_phylotree_with_inputs(mock_s3_resource, session, owner_group):
    username = "owner"
    user = user_factory(
        owner_group, name=username, auth0_user_id=username, email=username
    )
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    sample = sample_factory(
        owner_group,
        user,
        location,
        public_identifier=str(uuid.uuid4()),
        private_identifier=str(uuid.uuid4()),
    )
    input_entity = uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")

    gisaid_samples = ["gisaid_identifier"]
    phylo_run = phylorun_factory(
        owner_group,
        inputs=[input_entity],
        gisaid_ids=gisaid_samples,
    )
    samples = [sample]
    phylo_tree = phylotree_factory(
        phylo_run,
        samples,
        key=str(uuid.uuid4()),
    )
    upload_s3_file(mock_s3_resource, phylo_tree, samples, gisaid_samples)

    session.add_all([phylo_tree])
    session.commit()
    return phylo_tree, phylo_run, samples


def create_phylotree(mock_s3_resource, session):
    owner_group = group_factory()
    user = user_factory(owner_group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    sample = sample_factory(
        owner_group,
        user,
        location,
        public_identifier=str(uuid.uuid4()),
        private_identifier=str(uuid.uuid4()),
    )
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")

    samples = [sample]
    phylo_tree = phylotree_factory(
        phylorun_factory(owner_group),
        samples,
        key=str(uuid.uuid4()),
    )
    upload_s3_file(mock_s3_resource, phylo_tree, samples)

    session.add_all([phylo_tree, owner_group, owner_group])
    session.commit()
    return user, phylo_tree, samples


def test_tree_metadata_download(
    mock_s3_resource,
    session,
    app,
    client,
):
    """
    Test a regular tsv download for a sample submitted by the user's group
    """
    user, tree, samples = create_phylotree(mock_s3_resource, session)

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    res = client.get(f"/api/phylo_tree/sample_ids/{tree.id}")
    expected_filename = f"{tree.id}_sample_ids.tsv"
    expected_document = "Sample Identifier\tSelected\r\n" "root_identifier_1	no\r\n"
    for sample in samples:
        expected_document += f"{sample.private_identifier}	no\r\n"
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
    mock_s3_resource,
    session,
    app,
    client,
):
    """
    Test that we use public ids in the fasta file if the requester only has access to the
    samples sequence data but not private ids
    """
    owner_group = group_factory(name="owner_group")
    private_ids_group = group_factory(name="private_ids_group")
    noaccess_group = group_factory(name="noaccess_group")
    viewer_group = group_factory(name="viewer_group")
    viewer_user = create_unique_user(viewer_group, "viewer")
    private_ids_user = create_unique_user(private_ids_group, "private_ids")
    noaccess_user = create_unique_user(noaccess_group, "noaccess")
    phylo_tree, phylo_run, samples = create_phylotree_with_inputs(
        mock_s3_resource, session, owner_group
    )
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
                f"root_identifier_1	no\r\n"
                f"{samples[0].public_identifier}	yes\r\n"
                f"gisaid_identifier	yes\r\n"
            ),
        },
        {
            "user": private_ids_user,
            "expected_status": "200 OK",
            "expected_data": (
                "Sample Identifier\tSelected\r\n"
                f"root_identifier_1	no\r\n"
                f"{samples[0].private_identifier}	yes\r\n"
                f"gisaid_identifier	yes\r\n"
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
