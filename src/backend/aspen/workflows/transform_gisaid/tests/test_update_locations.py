from io import StringIO
from typing import Optional

from sqlalchemy.sql.expression import and_

from aspen.database.models import Location, User
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.usergroup import group_factory, user_factory
from aspen.workflows.transform_gisaid.update_locations import update_locations


def create_test_data(
    session,
    group_name=None,  # Override group name
    locations=None,  # Override group location
    suffix=None,
):
    if not suffix:
        suffix = "test"
    if group_name is None:
        group_name = f"testgroup-{suffix}"
    db_locations = []
    for location in locations:
        db_loc: Optional[Location] = (
            session.query(Location)
            .filter(
                and_(
                    Location.region == "North America",
                    Location.country == "USA",
                    Location.division == location[0],
                    Location.location == location[1],
                )
            )
            .one_or_none()
        )
        if not db_loc:
            db_loc = location_factory(
                "North America",
                "USA",
                location[0],
                location[1],
            )
        db_locations.append(db_loc)

    group = group_factory(
        name=group_name,
        address="none",
        prefix="GRP-",
        default_tree_location=db_locations[0],
    )
    uploaded_by_user: User = user_factory(
        group,
        email=f"{group_name}-{suffix}@dh.org",
        auth0_user_id=group_name,
    )
    session.add(group)
    samples = []
    for location in db_locations[1:]:
        samples.append(
            sample_factory(
                group,
                uploaded_by_user,
                location,
                private_identifier=f"private_identifier_{location.location}",
                public_identifier=f"public_identifier_{location.location}",
            )
        )

    session.add_all(samples)
    session.commit()


def mock_remote_db_uri(mocker, test_postgres_db_uri):
    mocker.patch(
        "aspen.config.config.Config.DATABASE_URI",
        new_callable=mocker.PropertyMock,
        return_value=test_postgres_db_uri,
    )


# Make sure our translations work properly.
def test_update_locations(mocker, session, postgres_database):
    locations = [
        ["California", "Tulare County"],
        ["Illinois", "Chicago"],
        ["Florida", "Orange County"],
    ]
    mock_remote_db_uri(mocker, postgres_database.as_uri())
    create_test_data(session, locations=locations)

    input_fh = StringIO()
    input_fh.write(
        # This line should be missing
        """North America/USA/Illinois/Chicago\tNorth America/USA/Illinois/Cook County IL\n"""
        # This line shouldn't be touched
        """North America/USA/Illinois/Chicago Heights\tNorth America/USA/Illinois/Cook County IL\n"""
        # This line should be missing
        """North America/USA/Florida/Orange County\tNorth America/USA/Florida/Orange County FL\n"""
        # This line should be missing
        """North America/USA/California/Tulare County\tNorth America/USA/California/Tulare County CA\n"""
        # This line should have the ' FL' removed
        """North America/USA/Florida/Small Town 1\tNorth America/USA/Florida/Orange County FL\n"""
        # This line should have the ' FL' removed
        """North America/USA/Florida/Small Town 2\tNorth America/USA/Florida/Orange County FL\n"""
        # This line shouldn't be touched
        """North America/USA/Illinois/LeaveMeAlone\tNorth America/USA/Illinois/LeaveMeAlone IL\n"""
    )
    input_fh.seek(0)
    output_fh = StringIO()

    update_locations(input_fh, output_fh)
    expected = (
        """North America/USA/Illinois/Chicago Heights\tNorth America/USA/Illinois/Cook County IL\n"""
        """North America/USA/Florida/Small Town 1\tNorth America/USA/Florida/Orange County\n"""
        """North America/USA/Florida/Small Town 2\tNorth America/USA/Florida/Orange County\n"""
        """North America/USA/Illinois/LeaveMeAlone\tNorth America/USA/Illinois/LeaveMeAlone IL\n"""
        # This is an extra rule we add to our mapping file
        """North America/USA/California/Southern San Joaquin Valley\tNorth America/USA/California/Tulare County\n"""
    )
    assert output_fh.getvalue() == expected
