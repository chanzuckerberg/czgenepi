import datetime
import json
from typing import Any, Optional, Sequence, Tuple

from aspen.app.views import api_utils
from aspen.app.views.sample import SAMPLE_KEY
from aspen.database.models import (
    CanSee,
    DataType,
    PublicRepositoryType,
    Sample,
    SequencingReadsCollection,
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
    sample = sample_factory(group)
    pathogen_genome = uploaded_pathogen_genome_factory(
        sample,
        pangolin_lineage="B.1.590",
        pangolin_probability=1.0,
        pangolin_version="2021-04-23",
        pangolin_last_updated=datetime.datetime.now(),
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
                    "status": "accepted",
                    "gisaid_id": pathogen_genome.accessions()[
                        0
                    ].public_identifier,
                },
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": api_utils.format_datetime(pathogen_genome.upload_date),
                "lineage": {
                    "lineage": pathogen_genome.pangolin_lineage,
                    "probability": pathogen_genome.pangolin_probability,
                    "version": pathogen_genome.pangolin_version,
                    "last_updated": api_utils.format_date(
                        pathogen_genome.pangolin_last_updated
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
    sample = sample_factory(group)
    # Test no GISAID accession logic
    pathogen_genome = uploaded_pathogen_genome_factory(
        sample,
        accessions=(
            AccessionWorkflowDirective(
                PublicRepositoryType.GISAID,
                datetime.datetime.now() - datetime.timedelta(days=5),
                None,
                None,
            ),
        ),
        pangolin_lineage="B.1.590",
        pangolin_probability=1.0,
        pangolin_version="2021-04-23",
        pangolin_last_updated=datetime.datetime.strptime("05-03-2021", "%m-%d-%Y"),
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
                "gisaid": {"status": "rejected", "gisaid_id": None},
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": api_utils.format_datetime(sequencing_read.upload_date),
                "lineage": {
                    "lineage": pathogen_genome.pangolin_lineage,
                    "probability": pathogen_genome.pangolin_probability,
                    "version": pathogen_genome.pangolin_version,
                    "last_updated": api_utils.format_date(
                        pathogen_genome.pangolin_last_updated
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
    sample = sample_factory(group)
    # Test no GISAID accession logic
    pathogen_genome = uploaded_pathogen_genome_factory(
        sample,
        accessions=(),
        pangolin_lineage="B.1.590",
        pangolin_probability=1.0,
        pangolin_version="2021-04-23",
        pangolin_last_updated=datetime.datetime.strptime("05-03-2021", "%m-%d-%Y"),
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
                "gisaid": {"status": "no_info", "gisaid_id": None},
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": api_utils.format_datetime(pathogen_genome.upload_date),
                "lineage": {
                    "lineage": pathogen_genome.pangolin_lineage,
                    "probability": pathogen_genome.pangolin_probability,
                    "version": pathogen_genome.pangolin_version,
                    "last_updated": api_utils.format_date(
                        pathogen_genome.pangolin_last_updated
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
    sample = sample_factory(group, czb_failed_genome_recovery=True)
    pathogen_genome = uploaded_pathogen_genome_factory(
        sample,
        pangolin_lineage="B.1.590",
        pangolin_probability=1.0,
        pangolin_version="2021-04-23",
        pangolin_last_updated=datetime.datetime.strptime("05-03-2021", "%m-%d-%Y"),
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
                "czb_failed_genome_recovery": True,
                "gisaid": {"status": "not_eligible", "gisaid_id": None},
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": api_utils.format_datetime(None),
                "lineage": {
                    "lineage": pathogen_genome.pangolin_lineage,
                    "probability": pathogen_genome.pangolin_probability,
                    "version": pathogen_genome.pangolin_version,
                    "last_updated": api_utils.format_date(
                        pathogen_genome.pangolin_last_updated
                    ),
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
    sample = sample_factory(group)
    # create a sample with a gisaid workflow but no accession yet
    pathogen_genome = uploaded_pathogen_genome_factory(
        sample,
        accessions=(
            AccessionWorkflowDirective(
                PublicRepositoryType.GISAID,
                datetime.datetime.now(),
                None,
                None,
            ),
        ),
        pangolin_lineage="B.1.590",
        pangolin_probability=1.0,
        pangolin_version="2021-04-23",
        pangolin_last_updated=datetime.datetime.strptime("05-03-2021", "%m-%d-%Y"),
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
                "gisaid": {"status": "submitted", "gisaid_id": None},
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": api_utils.format_datetime(
                    pathogen_genome.upload_date
                ),
                "lineage": {
                    "lineage": pathogen_genome.pangolin_lineage,
                    "probability": pathogen_genome.pangolin_probability,
                    "version": pathogen_genome.pangolin_version,
                    "last_updated": api_utils.format_date(
                        pathogen_genome.pangolin_last_updated
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
    sample = sample_factory(owner_group)
    pathogen_genome = uploaded_pathogen_genome_factory(
        sample,
        pangolin_lineage="B.1.590",
        pangolin_probability=1.0,
        pangolin_version="2021-04-23",
        pangolin_last_updated=datetime.datetime.strptime("05-03-2021", "%m-%d-%Y"),
    )
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
        pathogen_genome,
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

    sample, pathogen_genome, samples = _test_samples_view_cansee(
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
                "status": "accepted",
                "gisaid_id": uploaded_pathogen_genome_collection.accessions()[
                    0
                ].public_identifier,
            },
            "private_identifier": sample.private_identifier,
            "public_identifier": sample.public_identifier,
            "upload_date": api_utils.format_datetime(
                uploaded_pathogen_genome_collection.upload_date
            ),
            "lineage": {
                "lineage": pathogen_genome.pangolin_lineage,
                "probability": pathogen_genome.pangolin_probability,
                "version": pathogen_genome.pangolin_version,
                "last_updated": api_utils.format_date(
                    pathogen_genome.pangolin_last_updated
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
    sample, pathogen_genome, samples = _test_samples_view_cansee(
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
                "status": "accepted",
                "gisaid_id": uploaded_pathogen_genome_collection.accessions()[
                    0
                ].public_identifier,
            },
            "public_identifier": sample.public_identifier,
            "upload_date": api_utils.format_datetime(
                uploaded_pathogen_genome_collection.upload_date
            ),
            "lineage": {
                "lineage": pathogen_genome.pangolin_lineage,
                "probability": pathogen_genome.pangolin_probability,
                "version": pathogen_genome.pangolin_version,
                "last_updated": api_utils.format_date(
                    pathogen_genome.pangolin_last_updated
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

    sample, uploaded_pathogen_genome_collection, samples = _test_samples_view_cansee(
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
                "status": "accepted",
                "gisaid_id": uploaded_pathogen_genome_collection.accessions()[
                    0
                ].public_identifier,
            },
            "private_identifier": sample.private_identifier,
            "public_identifier": sample.public_identifier,
            "upload_date": api_utils.format_datetime(
                uploaded_pathogen_genome_collection.upload_date
            ),
            "lineage": {
                "lineage": uploaded_pathogen_genome_collection.pangolin_lineage,
                "probability": uploaded_pathogen_genome_collection.pangolin_probability,
                "version": uploaded_pathogen_genome_collection.pangolin_version,
                "last_updated": api_utils.format_date(
                    uploaded_pathogen_genome_collection.pangolin_last_updated
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
    sample = sample_factory(group)
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
        pangolin_lineage="B.1.590",
        pangolin_probability=1.0,
        pangolin_version="2021-04-23",
        pangolin_last_updated=datetime.datetime.strptime("05-03-2021", "%m-%d-%Y"),
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
                    "status": "accepted",
                    "gisaid_id": "public_identifier_succeeded",
                },
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": api_utils.format_datetime(
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
    sample = sample_factory(group)
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
        pangolin_lineage="B.1.590",
        pangolin_probability=1.0,
        pangolin_version="2021-04-23",
        pangolin_last_updated=datetime.datetime.strptime("05-03-2021", "%m-%d-%Y"),
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
                    "status": "accepted",
                    "gisaid_id": "public_identifier_later",
                },
                "private_identifier": sample.private_identifier,
                "public_identifier": sample.public_identifier,
                "upload_date": api_utils.format_datetime(
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
