import traceback
from typing import Optional

from click.testing import CliRunner
from sqlalchemy.sql.expression import and_

from aspen.database.models import Group, Location, TreeType, User
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.pathogen_repo_config import (
    setup_gisaid_and_genbank_repo_configs,
)
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_multifactory
from aspen.test_infra.models.usergroup import group_factory, user_factory
from aspen.test_infra.models.workflow import aligned_repo_data_factory
from aspen.workflows.nextstrain_run.create_phyloruns import launch_all, launch_one


def create_test_data(
    session,
    split_client,
    num_county_samples,  # Total # of samples to associate with a group
    num_selected_samples,  # How many of those samples are workflow inputs
    num_gisaid_samples,  # How many gisaid samples to add to a workflow
    group_name=None,  # Override group name
    group_location=None,  # Override group location
    group_division=None,  # Override group division
    user_email=None,  # Override user email
    template_args=None,  # Send template args
    tree_type: TreeType = TreeType.OVERVIEW,
):
    if group_name is None:
        group_name = f"testgroup-{tree_type.value}"
    group: Group = group_factory(
        name=group_name, division=group_division, location=group_location
    )
    if user_email is None:
        user_email = f"{group_name}{tree_type.value}@dh.org"
    uploaded_by_user: User = user_factory(
        group,
        email=user_email,
        auth0_user_id=group_name,
    )
    location: Optional[Location] = (
        session.query(Location)
        .filter(
            and_(
                Location.region == "North America",
                Location.country == "USA",
                Location.division == f"{group.division} Test Division",
                Location.location == f"{group.location} Test City",
            )
        )
        .one_or_none()
    )
    if not location:
        location = location_factory(
            "North America",
            "USA",
            f"{group.division} Test Division",
            f"{group.location} Test City",
        )

    pathogen, repo_config = setup_gisaid_and_genbank_repo_configs(
        session, split_client=split_client
    )
    session.add(group)

    pathogen_genomes = uploaded_pathogen_genome_multifactory(
        group, pathogen, uploaded_by_user, location, num_county_samples
    )

    selected_samples = pathogen_genomes[:num_selected_samples]
    gisaid_dump = aligned_repo_data_factory(
        pathogen=pathogen,
        repository=repo_config.public_repository,
        sequences_s3_key=f"{group_name}{tree_type.value}",
        metadata_s3_key=f"{group_name}{tree_type.value}",
    ).outputs[0]

    inputs = selected_samples + [gisaid_dump]
    session.add_all(inputs)
    if template_args is None:
        template_args = {}

    session.commit()
    return group, pathogen


def mock_remote_db_uri(mocker, test_postgres_db_uri):
    mocker.patch(
        "aspen.config.config.Config.DATABASE_URI",
        new_callable=mocker.PropertyMock,
        return_value=test_postgres_db_uri,
    )


def test_launch_one(mocker, session, split_client, postgres_database):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    group, pathogen = create_test_data(
        session, split_client, 10, 10, 10, user_email="hello@czgenepi.org"
    )
    split_repo_value = split_client.get_pathogen_treatment(
        "PATHOGEN_public_repository", pathogen
    )
    print(f"split_repo_value: {split_repo_value}")
    runner = CliRunner()
    result = runner.invoke(
        launch_one, [f"{group.id}", "--pathogen", pathogen.slug, "--dry-run"]
    )
    try:
        assert result.exit_code == 0
    except Exception:
        traceback.print_tb(result.exc_info[2])
        print(result.exc_info[1])
        print(result.exc_info[0])
    assert result.exit_code == 0


def test_launch_all(mocker, session, split_client, postgres_database):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    group, pathogen = create_test_data(
        session, split_client, 10, 10, 10, user_email="hello@czgenepi.org"
    )

    runner = CliRunner()
    result = runner.invoke(launch_all, ["--pathogen", pathogen.slug, "--dry-run"])
    try:
        assert result.exit_code == 0
    except Exception:
        traceback.print_tb(result.exc_info[2])
        print(result.exc_info[1])
        print(result.exc_info[0])
    assert result.exit_code == 0
