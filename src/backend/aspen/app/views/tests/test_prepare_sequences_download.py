from aspen.database.models import CanSee, DataType
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_factory
from aspen.test_infra.models.usergroup import group_factory, user_factory


def test_prepare_sequences_download(
    session,
    app,
    client,
):
    """
    Test a regular sequence download for a sample submitted by the user's group
    """
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    session.add(group)
    session.commit()

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    data = {
        "requested_sequences": {
            "sample_ids": [sample.public_identifier],
        }
    }
    res = client.get("/api/sequences", json=data)
    assert res.status == "200 OK"
    expected_filename = f"{user.group.name}_sample_sequences.fasta"
    assert (
        res.headers["Content-Disposition"]
        == f"attachment; filename={expected_filename}"
    )
    file_contents = str(res.data, encoding="UTF-8")
    assert "ATGCAAAAAA" in file_contents
    assert sample.private_identifier in file_contents


def test_prepare_sequences_download_no_access(
    session,
    app,
    client,
):
    """
    Test that we throw an error if the user requests a sequence they don't have access to
    """
    # create a sample for one group and another viewer group
    owner_group = group_factory()
    viewer_group = group_factory(name="County")
    user = user_factory(viewer_group)
    sample = sample_factory(owner_group, user)
    uploaded_pathogen_genome_factory(sample)

    session.add_all((owner_group, viewer_group))
    session.commit()

    # try and access the sample with the user from the group that does not have access
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    data = {
        "requested_sequences": {
            "sample_ids": [sample.private_identifier],
        }
    }

    res = client.get("/api/sequences", json=data)
    assert res.status == "403 FORBIDDEN"
    assert res.get_data() == b"User does not have access to the requested sequences"


def test_prepare_sequences_download_no_private_id_access(
    session,
    app,
    client,
):
    """
    Test that we use public ids in the fasta file if the requester only has access to the samples
    sequence data but not private ids
    """
    owner_group = group_factory()
    viewer_group = group_factory(name="CDPH")
    user = user_factory(viewer_group)
    sample = sample_factory(owner_group, user)
    uploaded_pathogen_genome_factory(sample)
    # give the viewer group access to the sequences from the owner group
    CanSee(
        viewer_group=viewer_group,
        owner_group=owner_group,
        data_type=DataType.SEQUENCES,
    )
    session.add_all((owner_group, viewer_group))
    session.commit()

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    data = {
        "requested_sequences": {
            "sample_ids": [sample.public_identifier],
        }
    }
    res = client.get("/api/sequences", json=data)
    assert res.status == "200 OK"
    expected_filename = f"{user.group.name}_sample_sequences.fasta"
    assert (
        res.headers["Content-Disposition"]
        == f"attachment; filename={expected_filename}"
    )
    file_contents = str(res.data, encoding="UTF-8")

    # Assert that the public id was used
    assert sample.public_identifier in file_contents
