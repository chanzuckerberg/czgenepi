import datetime

from aspen.database.models import CanSee, DataType, PublicRepositoryType
from aspen.test_infra.models.accession_workflow import AccessionWorkflowDirective
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
    res = client.post("/api/sequences", json=data)
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

    res = client.post("/api/sequences", json=data)
    assert res.status == "200 OK"
    assert res.get_data() == b""


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
    res = client.post("/api/sequences", json=data)
    assert res.status == "200 OK"
    expected_filename = f"{user.group.name}_sample_sequences.fasta"
    assert (
        res.headers["Content-Disposition"]
        == f"attachment; filename={expected_filename}"
    )
    file_contents = str(res.data, encoding="UTF-8")

    # Assert that the public id was used
    assert sample.public_identifier in file_contents


def test_access_matrix(
    session,
    app,
    client,
):
    """
    Test that we use public ids in the fasta file if the requester only has access to the samples
    sequence data but not private ids
    """
    owner_group1 = group_factory(name="group1")
    owner_group2 = group_factory(name="group2")
    viewer_group = group_factory(name="CDPH")
    user = user_factory(viewer_group)
    # give the viewer group access to the sequences from the owner group
    CanSee(
        viewer_group=viewer_group,
        owner_group=owner_group1,
        data_type=DataType.SEQUENCES,
    )
    CanSee(
        viewer_group=viewer_group,
        owner_group=owner_group2,
        data_type=DataType.PRIVATE_IDENTIFIERS,
    )
    sample1 = sample_factory(
        owner_group1, user, private_identifier="sample1", public_identifier="pub1"
    )
    sample2 = sample_factory(
        owner_group2, user, private_identifier="sample2", public_identifier="pub2"
    )
    sample3 = sample_factory(
        viewer_group, user, private_identifier="sample3", public_identifier="pub3"
    )
    sequences = {"sample1": "CAT", "sample2": "TAC", "sample3": "ATC"}
    accessions = {
        sequence_name: AccessionWorkflowDirective(
            PublicRepositoryType.GISAID,
            datetime.datetime.now(),
            datetime.datetime.now(),
            sequence_name,
        )
        for sequence_name in ["seq1", "seq2", "seq3"]
    }

    uploaded_pathogen_genome_factory(
        sample1, accessions=[accessions["seq1"]], sequence="CAT"
    )
    uploaded_pathogen_genome_factory(
        sample2, accessions=[accessions["seq2"]], sequence="TAC"
    )
    uploaded_pathogen_genome_factory(
        sample3, accessions=[accessions["seq3"]], sequence="ATC"
    )

    session.add_all((owner_group1, owner_group2, viewer_group))
    session.commit()

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}

    matrix = [
        {
            "samples": [
                sample1.public_identifier,
                sample2.public_identifier,
                sample3.public_identifier,
            ],
            "expected_public": [sample1],
            "expected_private": [sample3],
            "not_expected": [sample2],
        },
        {
            "samples": [
                sample1.private_identifier,
                sample2.private_identifier,
                sample3.private_identifier,
            ],
            "expected_public": [],
            "expected_private": [sample2, sample3],
            "not_expected": [sample1],
        },
    ]
    for case in matrix:
        data = {
            "requested_sequences": {
                "sample_ids": case["samples"],
            }
        }
        res = client.post("/api/sequences", json=data)
        assert res.status == "200 OK"
        expected_filename = f"{user.group.name}_sample_sequences.fasta"
        assert (
            res.headers["Content-Disposition"]
            == f"attachment; filename={expected_filename}"
        )
        file_contents = str(res.data, encoding="UTF-8")

        # Assert that we get the correct public, private id's and sequences.
        for sample in case["expected_public"]:
            assert f">{sample.public_identifier}" in file_contents
            assert f">{sample.private_identifier}" not in file_contents
            assert sequences[sample.private_identifier] in file_contents
        for sample in case["expected_private"]:
            assert f">{sample.private_identifier}" in file_contents
            assert f">{sample.public_identifier}" not in file_contents
            assert sequences[sample.private_identifier] in file_contents
        for sample in case["not_expected"]:
            assert f">{sample.private_identifier}" not in file_contents
            assert f">{sample.public_identifier}" not in file_contents
            assert sequences[sample.private_identifier] not in file_contents
