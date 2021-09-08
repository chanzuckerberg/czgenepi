import json

from aspen.test_infra.models.gisaid_metadata import gisaid_metadata_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_factory
from aspen.test_infra.models.usergroup import group_factory, user_factory
from aspen.test_infra.models.workflow import aligned_gisaid_dump_factory


def test_create_phylo_run(
    session,
    app,
    client,
):
    """
    Test phylo tree creation, local-only samples.
    """
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    gisaid_dump = aligned_gisaid_dump_factory()
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    session.add(group)
    session.add(gisaid_dump)
    session.commit()

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    data = {
        "name": "test phylorun",
        "tree_type": "overview",
        "samples": [sample.public_identifier],
    }
    res = client.post("/api/phylo_runs", json=data)
    assert res.status == "200 OK"
    response = json.loads(res.json)
    template_args = response["template_args"]
    assert template_args["division"] == group.division
    assert template_args["location"] == group.location
    assert "contextual.yaml" in response["template_file_path"]
    assert response["workflow_status"] == "STARTED"
    assert response["group"]["name"] == group.name
    assert "id" in response


def test_create_phylo_run_with_gisaid_ids(
    session,
    app,
    client,
):
    """
    Test phylo tree creation that includes a reference to a GISAID sequence.
    """
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    gisaid_dump = aligned_gisaid_dump_factory()
    gisaid_sample = gisaid_metadata_factory()
    session.add(group)
    session.add(gisaid_dump)
    session.add(gisaid_sample)
    session.commit()

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    data = {
        "name": "test phylorun",
        "tree_type": "overview",
        "samples": [sample.public_identifier, gisaid_sample.strain],
    }
    res = client.post("/api/phylo_runs", json=data)
    assert res.status == "200 OK"
    response = json.loads(res.json)
    template_args = response["template_args"]
    assert template_args["division"] == group.division
    assert template_args["location"] == group.location
    assert "contextual.yaml" in response["template_file_path"]
    assert response["workflow_status"] == "STARTED"
    assert response["group"]["name"] == group.name
    assert "id" in response


def test_create_invalid_phylo_run_name(
    session,
    app,
    client,
):
    """
    Test a phylo tree run request with a bad tree name.
    """
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    gisaid_dump = aligned_gisaid_dump_factory()
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    session.add(group)
    session.add(gisaid_dump)
    session.commit()

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    data = {
        "name": 3.1415926535,
        "tree_type": "overview",
        "samples": [sample.public_identifier],
    }
    res = client.post("/api/phylo_runs", json=data)
    assert res.status == "400 BAD REQUEST"


def test_create_invalid_phylo_run_tree_type(
    session,
    app,
    client,
):
    """
    Test a phylo tree run request with a bad tree type.
    """
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    gisaid_dump = aligned_gisaid_dump_factory()
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    session.add(group)
    session.add(gisaid_dump)
    session.commit()

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    data = {
        "name": "test phylorun",
        "tree_type": "global",
        "samples": [sample.public_identifier],
    }
    res = client.post("/api/phylo_runs", json=data)
    assert res.status == "400 BAD REQUEST"


def test_create_invalid_phylo_run_bad_sample_id(
    session,
    app,
    client,
):
    """
    Test a phylo tree run request with a bad sample id.
    """
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    gisaid_dump = aligned_gisaid_dump_factory()
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    session.add(group)
    session.add(gisaid_dump)
    session.commit()

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    data = {
        "name": "test phylorun",
        "tree_type": "overview",
        "samples": [sample.public_identifier, "bad_sample_identifier"],
    }
    res = client.post("/api/phylo_runs", json=data)
    assert res.status == "400 BAD REQUEST"


def test_create_invalid_phylo_run_sample_cannot_see(
    session,
    app,
    client,
):
    """
    Test a phylo tree run request with a sample a group should not have access to.
    """
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)

    group2 = group_factory(name="The Other Group")
    user2 = user_factory(
        group2, email="test_user@othergroup.org", auth0_user_id="other_test_auth0_id"
    )
    sample2 = sample_factory(group2, user2, public_identifier="USA/OTHER/123456")

    gisaid_dump = aligned_gisaid_dump_factory()
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    session.add(group)
    session.add(group2)
    session.add(gisaid_dump)
    session.commit()

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    data = {
        "name": "test phylorun",
        "tree_type": "overview",
        "samples": [sample.public_identifier, sample2.public_identifier],
    }
    res = client.post("/api/phylo_runs", json=data)
    assert res.status == "400 BAD REQUEST"


def test_create_phylo_run_unauthorized_access_redirect(
    session,
    app,
    client,
):
    """
    Test a request from an outside, unauthorized source.
    """
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)

    gisaid_dump = aligned_gisaid_dump_factory()
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    session.add(group)
    session.add(gisaid_dump)
    session.commit()

    data = {
        "name": "test phylorun",
        "tree_type": "overview",
        "samples": [sample.public_identifier],
    }
    res = client.post("/api/phylo_runs", json=data)
    assert res.status == "302 FOUND"
    assert "/login" in res.location
