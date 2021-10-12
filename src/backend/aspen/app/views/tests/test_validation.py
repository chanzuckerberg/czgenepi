from flask.testing import FlaskClient
from sqlalchemy.orm.session import Session

from aspen.test_infra.models.gisaid_metadata import gisaid_metadata_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.usergroup import group_factory, user_factory


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
    res = client.get("/api/validate/ids", json=data)

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
    res = client.get("/api/validate/ids", json=data)

    # request should not fail, should return list of samples that are missing from the DB
    assert res.status == "200 OK"
    response = res.json
    assert response["missing_sample_ids"] == ["this_is_missing"]
