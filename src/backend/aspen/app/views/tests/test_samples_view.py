import datetime
import json
from typing import Any, Optional, Sequence, Tuple

from sqlalchemy.orm import joinedload

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
    sample = sample_factory(group, user)
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
                "lineage": {
                    "lineage": uploaded_pathogen_genome.pangolin_lineage,
                    "probability": uploaded_pathogen_genome.pangolin_probability,
                    "version": uploaded_pathogen_genome.pangolin_version,
                    "last_updated": api_utils.format_date(
                        uploaded_pathogen_genome.pangolin_last_updated
                    ),
                },
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
                "lineage": {
                    "lineage": uploaded_pathogen_genome.pangolin_lineage,
                    "probability": uploaded_pathogen_genome.pangolin_probability,
                    "version": uploaded_pathogen_genome.pangolin_version,
                    "last_updated": api_utils.format_date(
                        uploaded_pathogen_genome.pangolin_last_updated
                    ),
                },
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
                "lineage": {
                    "lineage": uploaded_pathogen_genome.pangolin_lineage,
                    "probability": uploaded_pathogen_genome.pangolin_probability,
                    "version": uploaded_pathogen_genome.pangolin_version,
                    "last_updated": api_utils.format_date(
                        uploaded_pathogen_genome.pangolin_last_updated
                    ),
                },
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
                "lineage": {
                    "lineage": None,
                    "probability": None,
                    "version": None,
                    "last_updated": None,
                },
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
                "lineage": {
                    "lineage": uploaded_pathogen_genome.pangolin_lineage,
                    "probability": uploaded_pathogen_genome.pangolin_probability,
                    "version": uploaded_pathogen_genome.pangolin_version,
                    "last_updated": api_utils.format_date(
                        uploaded_pathogen_genome.pangolin_last_updated
                    ),
                },
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
            "lineage": {
                "lineage": uploaded_pathogen_genome.pangolin_lineage,
                "probability": uploaded_pathogen_genome.pangolin_probability,
                "version": uploaded_pathogen_genome.pangolin_version,
                "last_updated": api_utils.format_date(
                    uploaded_pathogen_genome.pangolin_last_updated
                ),
            },
        }
    ]


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
            "lineage": {
                "lineage": uploaded_pathogen_genome.pangolin_lineage,
                "probability": uploaded_pathogen_genome.pangolin_probability,
                "version": uploaded_pathogen_genome.pangolin_version,
                "last_updated": api_utils.format_date(
                    uploaded_pathogen_genome.pangolin_last_updated
                ),
            },
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
            "lineage": {
                "lineage": uploaded_pathogen_genome.pangolin_lineage,
                "probability": uploaded_pathogen_genome.pangolin_probability,
                "version": uploaded_pathogen_genome.pangolin_version,
                "last_updated": api_utils.format_date(
                    uploaded_pathogen_genome.pangolin_last_updated
                ),
            },
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
                "lineage": {
                    "lineage": uploaded_pathogen_genome.pangolin_lineage,
                    "probability": uploaded_pathogen_genome.pangolin_probability,
                    "version": uploaded_pathogen_genome.pangolin_version,
                    "last_updated": api_utils.format_date(
                        uploaded_pathogen_genome.pangolin_last_updated
                    ),
                },
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
                "lineage": {
                    "lineage": uploaded_pathogen_genome.pangolin_lineage,
                    "probability": uploaded_pathogen_genome.pangolin_probability,
                    "version": uploaded_pathogen_genome.pangolin_version,
                    "last_updated": api_utils.format_date(
                        uploaded_pathogen_genome.pangolin_last_updated
                    ),
                },
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
                "lineage": {
                    "lineage": None,
                    "probability": None,
                    "version": None,
                    "last_updated": "N/A",
                },
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
                "sequence": "AAAAAXNTCG",
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
    assert ["USA/groupname-1/2021", "USA/groupname-2/2021"] == public_ids

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
                "private_identifier": "private2",
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
    assert ["USA/groupname-1/2021", "USA/groupname-2/2021"] == public_ids

    sample_1 = (
        session.query(Sample)
        .options(joinedload(Sample.uploaded_pathogen_genome))
        .filter(Sample.private_identifier == "private")
        .one()
    )

    assert sample_1.uploaded_pathogen_genome.num_mixed == 1
    assert sample_1.uploaded_pathogen_genome.num_unambiguous_sites == 8
    assert sample_1.uploaded_pathogen_genome.num_missing_alleles == 1


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
        == b"Missing required fields ['private', 'location'] or encountered unexpected fields []"
    )
