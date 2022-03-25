from flask.testing import FlaskClient
from sqlalchemy.orm.session import Session

from aspen.test_infra.models.gisaid_metadata import gisaid_metadata_factory
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.usergroup import group_factory, user_factory


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
