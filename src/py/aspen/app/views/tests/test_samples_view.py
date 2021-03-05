import json
from typing import Any, Sequence, Tuple

from aspen.app.views import api_utils
from aspen.database.models import CanSee, DataType, Sample, SequencingReadsCollection
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.sequences import sequencing_read_factory
from aspen.test_infra.models.usergroup import group_factory, user_factory


def test_samples_view(
    session,
    app,
    client,
):
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group)
    sequencing_read = sequencing_read_factory(sample)
    session.add(group)
    session.commit()
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    res = client.get("/api/samples")
    expected = [
        {
            "collection_date": api_utils.format_date(sample.collection_date),
            "collection_location": sample.location,
            "private_identifier": sample.private_identifier,
            "public_identifier": sample.public_identifier,
            "upload_date": api_utils.format_datetime(sequencing_read.upload_date),
            "gisaid": sequencing_read.accessions[0].public_identifier,
        }
    ]
    assert expected == json.loads(res.get_data(as_text=True))


def _test_samples_view_cansee(
    session,
    client,
    cansee_datatypes: Sequence[DataType],
) -> Tuple[Sample, SequencingReadsCollection, Any]:
    owner_group = group_factory()
    viewer_group = group_factory(name="cdph", email="cdph@cdph.gov")
    user = user_factory(viewer_group)
    sample = sample_factory(owner_group)
    sequencing_read_collection = sequencing_read_factory(sample)
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
    return sample, sequencing_read_collection, json.loads(res.get_data(as_text=True))


def test_samples_view_no_cansee(
    session,
    app,
    client,
):
    _, _, json_response = _test_samples_view_cansee(
        session,
        client,
        cansee_datatypes=(),
    )
    assert json_response == []


def test_samples_view_cansee_trees(
    session,
    app,
    client,
):
    _, _, json_response = _test_samples_view_cansee(
        session,
        client,
        cansee_datatypes=(DataType.TREES,),
    )
    assert json_response == []


def test_samples_view_cansee_sequences(
    session,
    app,
    client,
):
    _, _, json_response = _test_samples_view_cansee(
        session,
        client,
        cansee_datatypes=(DataType.SEQUENCES,),
    )
    assert json_response == []


def test_samples_view_cansee_metadata(
    session,
    app,
    client,
):
    sample, sequencing_read_collection, json_response = _test_samples_view_cansee(
        session,
        client,
        cansee_datatypes=(DataType.METADATA,),
    )

    # no private identifier in the output.
    assert json_response == [
        {
            "collection_date": api_utils.format_date(sample.collection_date),
            "collection_location": sample.location,
            "public_identifier": sample.public_identifier,
            "upload_date": api_utils.format_datetime(
                sequencing_read_collection.upload_date
            ),
            "gisaid": sequencing_read_collection.accessions[0].public_identifier,
        }
    ]


def test_samples_view_cansee_private_identifiers(
    session,
    app,
    client,
):
    """This state really makes no sense because why would you be able to see private
    identifiers but not metadata??  But we'll ensure it still does the right thing."""
    _, _, json_response = _test_samples_view_cansee(
        session,
        client,
        cansee_datatypes=(DataType.PRIVATE_IDENTIFIERS,),
    )

    # no private identifier in the output.
    assert json_response == []


def test_samples_view_cansee_all(
    session,
    app,
    client,
):
    sample, sequencing_read_collection, json_response = _test_samples_view_cansee(
        session,
        client,
        cansee_datatypes=(DataType.METADATA, DataType.PRIVATE_IDENTIFIERS),
    )

    # no private identifier in the output.
    assert json_response == [
        {
            "collection_date": api_utils.format_date(sample.collection_date),
            "collection_location": sample.location,
            "private_identifier": sample.private_identifier,
            "public_identifier": sample.public_identifier,
            "upload_date": api_utils.format_datetime(
                sequencing_read_collection.upload_date
            ),
            "gisaid": sequencing_read_collection.accessions[0].public_identifier,
        }
    ]
