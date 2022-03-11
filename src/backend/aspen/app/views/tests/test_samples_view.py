import datetime

from flask.testing import FlaskClient
from sqlalchemy.orm import joinedload
from sqlalchemy.orm.session import Session

from aspen.app.views import api_utils
from aspen.database.models import Sample, UploadedPathogenGenome
from aspen.test_infra.models.gisaid_metadata import gisaid_metadata_factory
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.usergroup import group_factory, user_factory


def test_samples_create_view_pass_no_public_id(
    session,
    app,
    client,
):
    group = group_factory()
    user = user_factory(group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    session.add(group)
    session.add(location)
    session.commit()
    test_date = datetime.datetime.now()
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}

    data = [
        {
            "sample": {
                "private_identifier": "private",
                "collection_date": api_utils.format_date(test_date),
                "location_id": location.id,
                "private": True,
            },
            "pathogen_genome": {
                "sequence": "AAAKAANTCG",
                "sequencing_date": api_utils.format_date(test_date),
            },
        },
        {
            "sample": {
                "private_identifier": "private2",
                "collection_date": api_utils.format_date(test_date),
                "location_id": location.id,
                "private": True,
            },
            "pathogen_genome": {
                "sequence": "AACTGTNNNN",
                "sequencing_date": api_utils.format_date(test_date),
            },
        },
    ]
    res = client.post("/v2/samples/", json=data, content_type="application/json")
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
    datetime.datetime.now().year
    assert [
        f"hCoV-19/USA/groupname-1/{test_date.year}",
        f"hCoV-19/USA/groupname-2/{test_date.year}",
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
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    session.add(group)
    session.add(location)
    session.commit()
    test_date = datetime.datetime.now()

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}

    data = [
        {
            "sample": {
                "private_identifier": "private",
                "public_identifier": "",
                "collection_date": api_utils.format_date(test_date),
                "location_id": location.id,
                "private": True,
            },
            "pathogen_genome": {
                "sequence": "AAAKAANTCG",
                "sequencing_date": "",
            },
        },
        {
            "sample": {
                "private_identifier": "private2",
                "public_identifier": "",
                "collection_date": api_utils.format_date(test_date),
                "location_id": location.id,
                "private": True,
            },
            "pathogen_genome": {
                "sequence": "AACTKGTNNNN",
                "sequencing_date": test_date.strftime("%Y-%m-%d"),
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
    datetime.datetime.now().year
    assert [
        f"hCoV-19/USA/groupname-1/{test_date.year}",
        f"hCoV-19/USA/groupname-2/{test_date.year}",
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
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    session.add(group)
    session.add(location)
    session.commit()
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}

    data = [
        {
            "sample": {
                "private_identifier": "private",
                "public_identifier": "",
                "collection_date": api_utils.format_date(datetime.datetime.now()),
                "location_id": location.id,
                "private": True,
            },
            "pathogen_genome": {
                "sequence": "123456",
                "sequencing_date": "",
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
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    session.add(group)
    sample = sample_factory(
        group, user, location, private_identifier="private", public_identifier="public"
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
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    session.add(group)
    sample = sample_factory(
        group, user, location, private_identifier="private", public_identifier="public"
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
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
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
                "location_id": location.id,
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
        == b"{\"error\":\"Missing required fields ['private', 'location_id'] or encountered unexpected fields []\"}\n"
    )


def setup_validation_data(session: Session, client: FlaskClient):
    group = group_factory()
    user = user_factory(group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    sample = sample_factory(group, user, location)
    gisaid_sample = gisaid_metadata_factory()
    session.add(group)
    session.add(sample)
    session.add(gisaid_sample)
    session.commit()

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}

    return client, sample, gisaid_sample
