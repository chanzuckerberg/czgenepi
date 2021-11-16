import datetime
import json
from typing import Any, Optional, Sequence, Tuple

from flask.testing import FlaskClient
from sqlalchemy.orm import joinedload
from sqlalchemy.orm.session import Session

from aspen.app.views import api_utils
from aspen.app.views.sample import SAMPLE_KEY
from aspen.database.models import (
    CanSee,
    DataType,
    PublicRepositoryType,
    Sample,
    SequencingReadsCollection,
    UploadedPathogenGenome,
)
from aspen.test_infra.models.accession_workflow import AccessionWorkflowDirective
from aspen.test_infra.models.gisaid_accession import gisaid_accession_factory
from aspen.test_infra.models.gisaid_metadata import gisaid_metadata_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_factory
from aspen.test_infra.models.usergroup import group_factory, user_factory


def test_samples_view(
    session,
    app,
    client,
):
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user, private=True)
    uploaded_pathogen_genome = uploaded_pathogen_genome_factory(sample)
    session.add(group)
    session.commit()
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    res = client.get("/api/samples")
    expected = {
        SAMPLE_KEY: [
            {
                "collection_date": api_utils.format_date(sample.collection_date),
                "collection_location": sample.location,
                "czb_failed_genome_recovery": False,
                "gisaid": {
                    "status": "Accepted",
                    "gisaid_id": uploaded_pathogen_genome.accessions()[
                        0
                    ].public_identifier,
                },
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": api_utils.format_date(
                    uploaded_pathogen_genome.upload_date
                ),
                "sequencing_date": api_utils.format_date(
                    uploaded_pathogen_genome.sequencing_date
                ),
                "lineage": {
                    "lineage": uploaded_pathogen_genome.pangolin_lineage,
                    "probability": uploaded_pathogen_genome.pangolin_probability,
                    "version": uploaded_pathogen_genome.pangolin_version,
                    "last_updated": api_utils.format_date(
                        uploaded_pathogen_genome.pangolin_last_updated
                    ),
                },
                "private": True,
            }
        ]
    }
    assert expected == json.loads(res.get_data(as_text=True))


def test_samples_view_gisaid_rejected(
    session,
    app,
    client,
):
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    # Test no GISAID accession logic
    uploaded_pathogen_genome = uploaded_pathogen_genome_factory(
        sample,
        accessions=(
            AccessionWorkflowDirective(
                PublicRepositoryType.GISAID,
                datetime.datetime.now() - datetime.timedelta(days=5),
                None,
                None,
            ),
        ),
    )
    session.add(group)
    session.commit()
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    res = client.get("/api/samples")
    expected = {
        SAMPLE_KEY: [
            {
                "collection_date": api_utils.format_date(sample.collection_date),
                "collection_location": sample.location,
                "czb_failed_genome_recovery": False,
                "gisaid": {"status": "Rejected", "gisaid_id": None},
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": api_utils.format_date(
                    uploaded_pathogen_genome.upload_date
                ),
                "sequencing_date": api_utils.format_date(
                    uploaded_pathogen_genome.sequencing_date
                ),
                "lineage": {
                    "lineage": uploaded_pathogen_genome.pangolin_lineage,
                    "probability": uploaded_pathogen_genome.pangolin_probability,
                    "version": uploaded_pathogen_genome.pangolin_version,
                    "last_updated": api_utils.format_date(
                        uploaded_pathogen_genome.pangolin_last_updated
                    ),
                },
                "private": False,
            }
        ]
    }
    assert expected == json.loads(res.get_data(as_text=True))


def test_samples_view_gisaid_no_info(
    session,
    app,
    client,
):
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    # Test no GISAID accession logic
    uploaded_pathogen_genome = uploaded_pathogen_genome_factory(
        sample,
        accessions=(),
    )

    session.add(group)
    session.commit()
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    res = client.get("/api/samples")
    expected = {
        SAMPLE_KEY: [
            {
                "collection_date": api_utils.format_date(sample.collection_date),
                "collection_location": sample.location,
                "czb_failed_genome_recovery": False,
                "gisaid": {"status": "Not Yet Submitted", "gisaid_id": None},
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": api_utils.format_date(
                    uploaded_pathogen_genome.upload_date
                ),
                "sequencing_date": api_utils.format_date(
                    uploaded_pathogen_genome.sequencing_date
                ),
                "lineage": {
                    "lineage": uploaded_pathogen_genome.pangolin_lineage,
                    "probability": uploaded_pathogen_genome.pangolin_probability,
                    "version": uploaded_pathogen_genome.pangolin_version,
                    "last_updated": api_utils.format_date(
                        uploaded_pathogen_genome.pangolin_last_updated
                    ),
                },
                "private": False,
            }
        ]
    }
    assert expected == json.loads(res.get_data(as_text=True))


def test_samples_view_gisaid_not_eligible(
    session,
    app,
    client,
):
    group = group_factory()
    user = user_factory(group)
    # Mark the sample as failed
    sample = sample_factory(group, user, czb_failed_genome_recovery=True)
    session.add(group)
    session.commit()
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    res = client.get("/api/samples")
    expected = {
        SAMPLE_KEY: [
            {
                "collection_date": api_utils.format_date(sample.collection_date),
                "collection_location": sample.location,
                "czb_failed_genome_recovery": True,
                "gisaid": {"status": "Not Eligible", "gisaid_id": None},
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": api_utils.format_date(None),
                # In some cases, `sequencing_date` could actually still exist with a
                # failed genome recovery, but for this test it's None because the sample
                # has no underlying sequenced entity (no uploaded_pathogen_genome).
                "sequencing_date": api_utils.format_date(None),
                "lineage": {
                    "lineage": None,
                    "probability": None,
                    "version": None,
                    "last_updated": None,
                },
                "private": False,
            }
        ]
    }
    assert expected == json.loads(res.get_data(as_text=True))


def test_samples_view_gisaid_submitted(
    session,
    app,
    client,
):
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    # create a sample with a gisaid workflow but no accession yet
    uploaded_pathogen_genome = uploaded_pathogen_genome_factory(
        sample,
        accessions=(
            AccessionWorkflowDirective(
                PublicRepositoryType.GISAID,
                datetime.datetime.now(),
                None,
                None,
            ),
        ),
    )
    session.add(group)
    session.commit()
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    res = client.get("/api/samples")
    expected = {
        SAMPLE_KEY: [
            {
                "collection_date": api_utils.format_date(sample.collection_date),
                "collection_location": sample.location,
                "czb_failed_genome_recovery": False,
                "gisaid": {"status": "Submitted", "gisaid_id": None},
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": api_utils.format_date(
                    uploaded_pathogen_genome.upload_date
                ),
                "sequencing_date": api_utils.format_date(
                    uploaded_pathogen_genome.sequencing_date
                ),
                "lineage": {
                    "lineage": uploaded_pathogen_genome.pangolin_lineage,
                    "probability": uploaded_pathogen_genome.pangolin_probability,
                    "version": uploaded_pathogen_genome.pangolin_version,
                    "last_updated": api_utils.format_date(
                        uploaded_pathogen_genome.pangolin_last_updated
                    ),
                },
                "private": False,
            }
        ]
    }
    assert expected == json.loads(res.get_data(as_text=True))


def _test_samples_view_cansee(
    session,
    client,
    cansee_datatypes: Sequence[DataType],
    user_factory_kwargs: Optional[dict] = None,
) -> Tuple[Sample, SequencingReadsCollection, Any]:
    user_factory_kwargs = user_factory_kwargs or {}
    owner_group = group_factory()
    viewer_group = group_factory(name="cdph")
    user = user_factory(viewer_group, **user_factory_kwargs)
    sample = sample_factory(owner_group, user)
    # create a private sample as well to make sure it doesn't get shown unless admin
    private_sample = sample_factory(
        owner_group,
        user,
        private=True,
        private_identifier="private_id",
        public_identifier="public_id_2",
    )
    uploaded_pathogen_genome_factory(
        private_sample,
        accessions=(
            AccessionWorkflowDirective(
                PublicRepositoryType.GISAID,
                datetime.datetime.now(),
                None,
                None,
            ),
        ),
    )

    uploaded_pathogen_genome = uploaded_pathogen_genome_factory(sample)
    for cansee_datatype in cansee_datatypes:
        CanSee(
            viewer_group=viewer_group,
            owner_group=owner_group,
            data_type=cansee_datatype,
        )
    session.add_all((owner_group, viewer_group))
    session.commit()

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    res = client.get("/api/samples")
    return (
        sample,
        uploaded_pathogen_genome,
        json.loads(res.get_data(as_text=True))[SAMPLE_KEY],
    )


def test_samples_view_no_cansee(
    session,
    app,
    client,
):
    _, _, samples = _test_samples_view_cansee(
        session,
        client,
        cansee_datatypes=(),
    )
    assert samples == []


def test_samples_view_system_admin(
    session,
    app,
    client,
):

    sample, uploaded_pathogen_genome, samples = _test_samples_view_cansee(
        session,
        client,
        cansee_datatypes=(),
        user_factory_kwargs={
            "system_admin": True,
        },
    )
    # assert that we get both the public and private samples back
    assert len(samples) == 2
    private_ids = {sample["private_identifier"] for sample in samples}
    private = {sample["private"] for sample in samples}
    assert private_ids == {"private_identifer", "private_id"}
    assert private == {True, False}


def test_samples_view_cansee_trees(
    session,
    app,
    client,
):
    _, _, samples = _test_samples_view_cansee(
        session,
        client,
        cansee_datatypes=(DataType.TREES,),
    )
    assert samples == []


def test_samples_view_cansee_sequences(
    session,
    app,
    client,
):
    _, _, samples = _test_samples_view_cansee(
        session,
        client,
        cansee_datatypes=(DataType.SEQUENCES,),
    )
    assert samples == []


def test_samples_view_cansee_metadata(
    session,
    app,
    client,
):
    sample, uploaded_pathogen_genome, samples = _test_samples_view_cansee(
        session,
        client,
        cansee_datatypes=(DataType.METADATA,),
    )

    # no private identifier in the output.
    assert samples == [
        {
            "collection_date": api_utils.format_date(sample.collection_date),
            "collection_location": sample.location,
            "czb_failed_genome_recovery": False,
            "gisaid": {
                "status": "Accepted",
                "gisaid_id": uploaded_pathogen_genome.accessions()[0].public_identifier,
            },
            "public_identifier": sample.public_identifier,
            "upload_date": api_utils.format_date(uploaded_pathogen_genome.upload_date),
            "sequencing_date": api_utils.format_date(
                uploaded_pathogen_genome.sequencing_date
            ),
            "lineage": {
                "lineage": uploaded_pathogen_genome.pangolin_lineage,
                "probability": uploaded_pathogen_genome.pangolin_probability,
                "version": uploaded_pathogen_genome.pangolin_version,
                "last_updated": api_utils.format_date(
                    uploaded_pathogen_genome.pangolin_last_updated
                ),
            },
            "private": False,
        }
    ]


def test_samples_view_cansee_private_identifiers(
    session,
    app,
    client,
):
    """This state really makes no sense because why would you be able to see private
    identifiers but not metadata??  But we'll ensure it still does the right thing."""
    _, _, samples = _test_samples_view_cansee(
        session,
        client,
        cansee_datatypes=(DataType.PRIVATE_IDENTIFIERS,),
    )

    # no private identifier in the output.
    assert samples == []


def test_samples_view_cansee_all(
    session,
    app,
    client,
):

    sample, uploaded_pathogen_genome, samples = _test_samples_view_cansee(
        session,
        client,
        cansee_datatypes=(DataType.METADATA, DataType.PRIVATE_IDENTIFIERS),
    )

    # no private identifier in the output.
    assert samples == [
        {
            "collection_date": api_utils.format_date(sample.collection_date),
            "collection_location": sample.location,
            "czb_failed_genome_recovery": False,
            "gisaid": {
                "status": "Accepted",
                "gisaid_id": uploaded_pathogen_genome.accessions()[0].public_identifier,
            },
            "private_identifier": sample.private_identifier,
            "public_identifier": sample.public_identifier,
            "upload_date": api_utils.format_date(uploaded_pathogen_genome.upload_date),
            "sequencing_date": api_utils.format_date(
                uploaded_pathogen_genome.sequencing_date
            ),
            "lineage": {
                "lineage": uploaded_pathogen_genome.pangolin_lineage,
                "probability": uploaded_pathogen_genome.pangolin_probability,
                "version": uploaded_pathogen_genome.pangolin_version,
                "last_updated": api_utils.format_date(
                    uploaded_pathogen_genome.pangolin_last_updated
                ),
            },
            "private": False,
        }
    ]


def test_samples_failed_accession(
    session,
    app,
    client,
):
    """Add a sample with one successful and one failed accession attempt.  The samples
    view should return the successful accession ID."""
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    uploaded_pathogen_genome = uploaded_pathogen_genome_factory(
        sample,
        accessions=(
            # failed accession.
            AccessionWorkflowDirective(
                PublicRepositoryType.GISAID,
                datetime.datetime.now() - datetime.timedelta(days=1, hours=2),
                None,
                None,
            ),
            AccessionWorkflowDirective(
                PublicRepositoryType.GISAID,
                datetime.datetime.now() - datetime.timedelta(days=1, hours=1),
                datetime.datetime.now() - datetime.timedelta(days=1),
                "public_identifier_succeeded",
            ),
        ),
    )

    for accession in uploaded_pathogen_genome.accessions():
        print(type(accession))
    session.add(group)
    session.commit()
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    res = client.get("/api/samples")
    expected = {
        SAMPLE_KEY: [
            {
                "collection_date": api_utils.format_date(sample.collection_date),
                "collection_location": sample.location,
                "czb_failed_genome_recovery": False,
                "gisaid": {
                    "status": "Accepted",
                    "gisaid_id": "public_identifier_succeeded",
                },
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": api_utils.format_date(
                    uploaded_pathogen_genome.upload_date
                ),
                "sequencing_date": api_utils.format_date(
                    uploaded_pathogen_genome.sequencing_date
                ),
                "lineage": {
                    "lineage": uploaded_pathogen_genome.pangolin_lineage,
                    "probability": uploaded_pathogen_genome.pangolin_probability,
                    "version": uploaded_pathogen_genome.pangolin_version,
                    "last_updated": api_utils.format_date(
                        uploaded_pathogen_genome.pangolin_last_updated
                    ),
                },
                "private": False,
            }
        ]
    }
    assert expected == json.loads(res.get_data(as_text=True))


def test_samples_multiple_accession(
    session,
    app,
    client,
):
    """Add a sample with two successful accession attempts.  The samples view should
    return the latest accession ID."""
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    uploaded_pathogen_genome = uploaded_pathogen_genome_factory(
        sample,
        accessions=(
            # failed accession.
            AccessionWorkflowDirective(
                PublicRepositoryType.GISAID,
                datetime.datetime.now() - datetime.timedelta(days=1, hours=2),
                datetime.datetime.now() - datetime.timedelta(days=1, hours=1),
                "public_identifier_earlier",
            ),
            AccessionWorkflowDirective(
                PublicRepositoryType.GISAID,
                datetime.datetime.now() - datetime.timedelta(days=1, hours=1),
                datetime.datetime.now() - datetime.timedelta(days=1),
                "public_identifier_later",
            ),
        ),
    )
    session.add(group)
    session.commit()
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    res = client.get("/api/samples")
    expected = {
        SAMPLE_KEY: [
            {
                "collection_date": api_utils.format_date(sample.collection_date),
                "collection_location": sample.location,
                "czb_failed_genome_recovery": False,
                "gisaid": {
                    "status": "Accepted",
                    "gisaid_id": "public_identifier_later",
                },
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": api_utils.format_date(
                    uploaded_pathogen_genome.upload_date
                ),
                "sequencing_date": api_utils.format_date(
                    uploaded_pathogen_genome.sequencing_date
                ),
                "lineage": {
                    "lineage": uploaded_pathogen_genome.pangolin_lineage,
                    "probability": uploaded_pathogen_genome.pangolin_probability,
                    "version": uploaded_pathogen_genome.pangolin_version,
                    "last_updated": api_utils.format_date(
                        uploaded_pathogen_genome.pangolin_last_updated
                    ),
                },
                "private": False,
            }
        ]
    }
    assert expected == json.loads(res.get_data(as_text=True))


def test_samples_view_no_pangolin(
    session,
    app,
    client,
):
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    uploaded_pathogen_genome = uploaded_pathogen_genome_factory(
        sample,
        pangolin_lineage=None,
        pangolin_probability=None,
        pangolin_version=None,
        pangolin_last_updated=None,
    )
    session.add(group)
    session.commit()
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    res = client.get("/api/samples")
    expected = {
        SAMPLE_KEY: [
            {
                "collection_date": api_utils.format_date(sample.collection_date),
                "collection_location": sample.location,
                "czb_failed_genome_recovery": False,
                "gisaid": {
                    "status": "Accepted",
                    "gisaid_id": uploaded_pathogen_genome.accessions()[
                        0
                    ].public_identifier,
                },
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": api_utils.format_date(
                    uploaded_pathogen_genome.upload_date
                ),
                "sequencing_date": api_utils.format_date(
                    uploaded_pathogen_genome.sequencing_date
                ),
                "lineage": {
                    "lineage": None,
                    "probability": None,
                    "version": None,
                    "last_updated": "N/A",
                },
                "private": False,
            }
        ]
    }
    assert expected == json.loads(res.get_data(as_text=True))


def test_samples_create_view_pass_no_public_id(
    session,
    app,
    client,
):
    group = group_factory()
    user = user_factory(group)
    session.add(group)
    session.commit()
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}

    data = [
        {
            "sample": {
                "private_identifier": "private",
                "collection_date": api_utils.format_date(datetime.datetime.now()),
                "location": "Ventura County",
                "private": True,
            },
            "pathogen_genome": {
                "sequence": "AAAKAANTCG",
                "sequencing_date": api_utils.format_date(datetime.datetime.now()),
                "isl_access_number": "test_accession_number",
            },
        },
        {
            "sample": {
                "private_identifier": "private2",
                "collection_date": api_utils.format_date(datetime.datetime.now()),
                "location": "Ventura County",
                "private": True,
            },
            "pathogen_genome": {
                "sequence": "AACTGTNNNN",
                "sequencing_date": api_utils.format_date(datetime.datetime.now()),
                "isl_access_number": "test_accession_number2",
            },
        },
    ]
    res = client.post("/api/samples/create", json=data, content_type="application/json")
    assert res.status == "200 OK"
    session.close()
    session.begin()

    samples = session.query(
        Sample.private_identifier.in_(["private", "private2"])
    ).all()
    uploaded_pathogen_genomes = session.query(UploadedPathogenGenome).all()

    assert len(samples) == 2
    assert len(uploaded_pathogen_genomes) == 2
    # check that creating new public identifiers works
    public_ids = sorted([i.public_identifier for i in session.query(Sample).all()])
    assert [
        "hCoV-19/USA/groupname-1/2021",
        "hCoV-19/USA/groupname-2/2021",
    ] == public_ids

    sample_1 = (
        session.query(Sample)
        .options(joinedload(Sample.uploaded_pathogen_genome))
        .filter(Sample.private_identifier == "private")
        .one()
    )

    assert sample_1.uploaded_pathogen_genome.num_mixed == 1
    assert sample_1.uploaded_pathogen_genome.num_unambiguous_sites == 8
    assert sample_1.uploaded_pathogen_genome.num_missing_alleles == 1


def test_samples_create_view_pass_no_sequencing_date(
    session,
    app,
    client,
):
    group = group_factory()
    user = user_factory(group)
    session.add(group)
    session.commit()
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}

    data = [
        {
            "sample": {
                "private_identifier": "private",
                "public_identifier": "",
                "collection_date": api_utils.format_date(datetime.datetime.now()),
                "location": "Ventura County",
                "private": True,
            },
            "pathogen_genome": {
                "sequence": "AAAKAANTCG",
                "sequencing_date": "",
                "isl_access_number": "test_accession_number",
            },
        },
        {
            "sample": {
                "private_identifier": "private2",
                "public_identifier": "",
                "collection_date": api_utils.format_date(datetime.datetime.now()),
                "location": "Ventura County",
                "private": True,
            },
            "pathogen_genome": {
                "sequence": "AACTKGTNNNN",
                "sequencing_date": "2021-06-15",
                "isl_access_number": "test_accession_number2",
            },
        },
    ]
    res = client.post("/api/samples/create", json=data, content_type="application/json")
    assert res.status == "200 OK"
    session.close()
    session.begin()

    samples = session.query(
        Sample.private_identifier.in_(["private", "private2"])
    ).all()
    uploaded_pathogen_genomes = session.query(UploadedPathogenGenome).all()

    assert len(samples) == 2
    assert len(uploaded_pathogen_genomes) == 2
    # check that creating new public identifiers works
    public_ids = sorted([i.public_identifier for i in session.query(Sample).all()])
    assert [
        "hCoV-19/USA/groupname-1/2021",
        "hCoV-19/USA/groupname-2/2021",
    ] == public_ids

    sample_1 = (
        session.query(Sample)
        .options(joinedload(Sample.uploaded_pathogen_genome))
        .filter(Sample.private_identifier == "private")
        .one()
    )

    assert sample_1.uploaded_pathogen_genome.num_mixed == 1
    assert sample_1.uploaded_pathogen_genome.num_unambiguous_sites == 8
    assert sample_1.uploaded_pathogen_genome.num_missing_alleles == 1


def test_samples_create_view_invalid_sequence(
    session,
    app,
    client,
):
    group = group_factory()
    user = user_factory(group)
    session.add(group)
    session.commit()
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}

    data = [
        {
            "sample": {
                "private_identifier": "private",
                "public_identifier": "",
                "collection_date": api_utils.format_date(datetime.datetime.now()),
                "location": "Ventura County",
                "private": True,
            },
            "pathogen_genome": {
                "sequence": "123456",
                "sequencing_date": "",
                "isl_access_number": "test_accession_number",
            },
        },
    ]
    res = client.post("/api/samples/create", json=data, content_type="application/json")
    assert res.status == "400 BAD REQUEST"
    assert (
        res.get_data()
        == b'{"error":"Sample private contains invalid sequence characters,'
        b' accepted characters are [WSKMYRVHDBNZNATCGU-]"}\n'
    )


def test_samples_create_view_fail_duplicate_ids(
    session,
    app,
    client,
):
    group = group_factory()
    user = user_factory(group)
    session.add(group)
    sample = sample_factory(
        group, user, private_identifier="private", public_identifier="public"
    )
    session.add(sample)
    session.commit()
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}

    data = [
        {
            "sample": {
                "private_identifier": "private",
                "public_identifier": "public",
                "collection_date": api_utils.format_date(datetime.datetime.now()),
                "location": "Ventura County",
                "private": True,
            },
            "pathogen_genome": {
                "sequence": "AAAAAXNTCG",
                "sequencing_date": "",
                "isl_access_number": "test_accession_number",
            },
        },
        {
            "sample": {
                "private_identifier": "private1",
                "public_identifier": "",
                "collection_date": api_utils.format_date(datetime.datetime.now()),
                "location": "Ventura County",
                "private": True,
            },
            "pathogen_genome": {
                "sequence": "AACTGTNNNN",
                "sequencing_date": "",
                "isl_access_number": "test_accession_number2",
            },
        },
    ]
    res = client.post("/api/samples/create", json=data, content_type="application/json")
    assert res.status == "400 BAD REQUEST"
    assert (
        res.get_data()
        == b"{\"error\":\"Error inserting data, private_identifiers ['private'] or public_identifiers: ['public'] already exist in our database, please remove these samples before proceeding with upload.\"}\n"
    )


def test_samples_create_view_fail_duplicate_ids_in_request_data(
    session,
    app,
    client,
):
    group = group_factory()
    user = user_factory(group)
    session.add(group)
    sample = sample_factory(
        group, user, private_identifier="private", public_identifier="public"
    )
    session.add(sample)
    session.commit()
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}

    data = [
        {
            "sample": {
                "private_identifier": "private",
                "public_identifier": "public",
                "collection_date": api_utils.format_date(datetime.datetime.now()),
                "location": "Ventura County",
                "private": True,
            },
            "pathogen_genome": {
                "sequence": "AAAAAXNTCG",
                "sequencing_date": "",
                "isl_access_number": "test_accession_number",
            },
        },
        {
            "sample": {
                "private_identifier": "private",
                "public_identifier": "",
                "collection_date": api_utils.format_date(datetime.datetime.now()),
                "location": "Ventura County",
                "private": True,
            },
            "pathogen_genome": {
                "sequence": "AACTGTNNNN",
                "sequencing_date": "",
                "isl_access_number": "test_accession_number2",
            },
        },
    ]
    res = client.post("/api/samples/create", json=data, content_type="application/json")
    assert res.status == "400 BAD REQUEST"
    assert (
        res.get_data()
        == b'{"error":"Error processing data, either duplicate private_identifiers: [\'private\'] or duplicate public identifiers: [] exist in the upload files, please rename duplicates before proceeding with upload."}\n'
    )


def test_samples_create_view_fail_missing_required_fields(
    session,
    app,
    client,
):
    group = group_factory()
    user = user_factory(group)
    session.add(group)
    session.commit()
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}

    data = [
        {
            "sample": {
                "private_identifier": "private",
                "public_identifier": "",
                "collection_date": api_utils.format_date(datetime.datetime.now()),
            },
            "pathogen_genome": {
                "sequence": "AAAAAAAAA",
            },
        },
        {
            "sample": {
                "private_identifier": "private2",
                "collection_date": api_utils.format_date(datetime.datetime.now()),
                "location": "Ventura County",
                "private": True,
            },
            "pathogen_genome": {
                "sequence": "AAAAAAAAA",
            },
        },
    ]
    res = client.post("/api/samples/create", json=data, content_type="application/json")
    assert res.status == "400 BAD REQUEST"
    assert (
        res.get_data()
        == b"{\"error\":\"Missing required fields ['private', 'location'] or encountered unexpected fields []\"}\n"
    )


def test_update_sample_public_ids(
    session,
    app,
    client,
):
    group = group_factory()
    user = user_factory(group, system_admin=True)
    session.add(group)

    private_to_public = dict(
        zip(
            ["private1", "private2", "private3"],
            ["public1_update", "public2_update", "public3_update"],
        )
    )

    for priv, pub in private_to_public.items():
        sample = sample_factory(
            group,
            user,
            private_identifier=priv,
            public_identifier=pub.replace("_update", ""),
        )
        session.add(sample)

    session.commit()

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}

    data = {"group_id": group.id, "id_mapping": private_to_public}

    res = client.post(
        "/api/samples/update/publicids", json=data, content_type="application/json"
    )
    assert res.status == "200 OK"

    # assert samples have been updated:
    s = (
        session.query(Sample)
        .filter(Sample.private_identifier.in_(private_to_public.keys()))
        .all()
    )
    for r in s:
        assert r.public_identifier == private_to_public[r.private_identifier]


def test_update_sample_public_ids_duplicate_public_id(
    session,
    app,
    client,
):
    group = group_factory()
    user = user_factory(group, system_admin=True)
    session.add(group)
    private_to_public = dict(
        zip(
            ["private1", "private2", "private3"],
            ["public1_update", "public2_update", "public3_update"],
        )
    )

    for priv, pub in private_to_public.items():
        sample = sample_factory(
            group, user, private_identifier=priv, public_identifier=pub
        )
        session.add(sample)

    session.commit()

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}

    data = {"group_id": group.id, "id_mapping": private_to_public}
    res = client.post(
        "/api/samples/update/publicids", json=data, content_type="application/json"
    )
    assert res.status == "400 BAD REQUEST"
    assert (
        res.get_data()
        == b"{\"error\":\"Public Identifiers ['public1_update', 'public2_update', 'public3_update'] are already in the database\"}\n"
    )


def test_update_sample_public_ids_private_ids_not_found(
    session,
    app,
    client,
):
    group = group_factory()
    user = user_factory(group, system_admin=True)
    session.add(group)
    session.commit()
    private_to_public = dict(
        zip(
            ["private1", "private2", "private3"],
            ["public1_update", "public2_update", "public3_update"],
        )
    )

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}

    data = {"group_id": group.id, "id_mapping": private_to_public}
    res = client.post(
        "/api/samples/update/publicids", json=data, content_type="application/json"
    )
    assert res.status == "400 BAD REQUEST"
    assert (
        res.get_data()
        == b"{\"error\":\"Private Identifiers ['private1', 'private2', 'private3'] not found in DB\"}\n"
    )


def test_update_sample_public_ids_not_system_admin(
    session,
    app,
    client,
):
    group = group_factory()
    user = user_factory(group, system_admin=False)
    session.add(group)
    session.commit()
    private_to_public = dict(
        zip(
            ["private1", "private2", "private3"],
            ["public1_update", "public2_update", "public3_update"],
        )
    )

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}

    data = {"group_id": group.id, "id_mapping": private_to_public}
    res = client.post(
        "/api/samples/update/publicids", json=data, content_type="application/json"
    )
    assert res.status == "400 BAD REQUEST"
    assert (
        res.get_data()
        == b'{"error":"user making update request must be a system admin"}\n'
    )


def test_update_sample_gisaid_isl(
    session,
    app,
    client,
):
    group = group_factory()
    user = user_factory(group, system_admin=True)
    session.add(group)

    private_to_public = dict(
        zip(
            ["private1", "private2", "private3"],
            ["isl_1", "isl_2", "isl_3"],
        )
    )

    for priv, pub in private_to_public.items():
        sample = sample_factory(
            group, user, private_identifier=priv, public_identifier=f"{pub}_public"
        )
        uploaded_pathogen_genome = uploaded_pathogen_genome_factory(
            sample, sequence="ATGCAAAAAA", accessions=()
        )
        gisaid_accession_factory(uploaded_pathogen_genome, f"{pub}_old")
        session.add(sample)

    session.commit()

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}

    data = {
        "group_id": group.id,
        "id_mapping": private_to_public,
        "public_ids_are_gisaid_isl": True,
    }

    res = client.post(
        "/api/samples/update/publicids", json=data, content_type="application/json"
    )

    assert res.status == "200 OK"

    # assert samples have been updated:
    s = (
        session.query(Sample)
        .options(joinedload(Sample.uploaded_pathogen_genome))
        .filter(Sample.private_identifier.in_(private_to_public.keys()))
        .all()
    )
    for r in s:
        accessions = r.uploaded_pathogen_genome.accessions()
        for a in accessions:
            assert a.public_identifier == private_to_public[r.private_identifier]


def test_update_sample_new_gisaid_isl(
    session,
    app,
    client,
):
    group = group_factory()
    user = user_factory(group, system_admin=True)
    session.add(group)

    private_to_public = dict(
        zip(
            ["private1", "private2", "private3"],
            ["isl_1", "isl_2", "isl_3"],
        )
    )

    for priv, pub in private_to_public.items():
        sample = sample_factory(
            group, user, private_identifier=priv, public_identifier=f"{pub}_public"
        )
        uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA", accessions=())
        session.add(sample)

    session.commit()

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}

    data = {
        "group_id": group.id,
        "id_mapping": private_to_public,
        "public_ids_are_gisaid_isl": True,
    }

    res = client.post(
        "/api/samples/update/publicids", json=data, content_type="application/json"
    )

    assert res.status == "200 OK"

    # assert samples have been updated:
    s = (
        session.query(Sample)
        .options(joinedload(Sample.uploaded_pathogen_genome))
        .filter(Sample.private_identifier.in_(private_to_public.keys()))
        .all()
    )
    for r in s:
        accessions = r.uploaded_pathogen_genome.accessions()
        for a in accessions:
            assert a.public_identifier == private_to_public[r.private_identifier]


def setup_validation_data(session: Session, client: FlaskClient):
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    gisaid_sample = gisaid_metadata_factory()
    session.add(group)
    session.add(sample)
    session.add(gisaid_sample)
    session.commit()

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}

    return client, sample, gisaid_sample


def test_validation_endpoint(
    session,
    app,
    client,
):
    """
    Test that validation endpoint is correctly identifying identifiers that are in the DB, and that samples are properly stripped of hCoV-19/ prefix
    """

    client, sample, gisaid_sample = setup_validation_data(session, client)

    # add hCoV-19/ as prefix to gisaid identifier to check that stripping of prefix is being done correctly
    data = {
        "sample_ids": [sample.public_identifier, f"hCoV-19/{gisaid_sample.strain}"],
    }
    res = client.post("/api/samples/validate-ids", json=data)

    assert res.status == "200 OK"
    response = res.json
    assert response["missing_sample_ids"] == []


def test_validation_endpoint_missing_identifier(
    session,
    app,
    client,
):
    """
    Test that validation endpoint is correctly identifying identifier that are not aspen public or private ids or gisaid ids
    """

    client, sample, gisaid_sample = setup_validation_data(session, client)
    data = {
        "sample_ids": [
            sample.public_identifier,
            gisaid_sample.strain,
            "this_is_missing",
        ],
    }
    res = client.post("/api/samples/validate-ids", json=data)

    # request should not fail, should return list of samples that are missing from the DB
    assert res.status == "200 OK"
    response = res.json
    assert response["missing_sample_ids"] == ["this_is_missing"]
