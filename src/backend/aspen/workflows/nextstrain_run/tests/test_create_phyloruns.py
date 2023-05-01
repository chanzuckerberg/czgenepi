from typing import Optional

from sqlalchemy.sql.expression import and_

from aspen.database.models import (
    Group,
    Location,
    Pathogen,
    TreeType,
    User,
    WorkflowStatusType,
)
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.pathogen import pathogen_factory
from aspen.test_infra.models.repository import random_default_repo_factory
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
    template_args=None,  # Send template args
    tree_type: TreeType = TreeType.OVERVIEW,
):
    if group_name is None:
        group_name = f"testgroup-{tree_type.value}"
    group: Group = group_factory(
        name=group_name, division=group_division, location=group_location
    )
    uploaded_by_user: User = user_factory(
        group,
        email=f"{group_name}{tree_type.value}@dh.org",
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
    repository = random_default_repo_factory(split_client)
    pathogen: Optional[Pathogen] = (
        session.query(Pathogen).filter(Pathogen.slug == "SC2").one_or_none()
    )
    if not pathogen:
        pathogen = pathogen_factory("SC2", "SARS-CoV-2")
    session.add(group)

    pathogen_genomes = uploaded_pathogen_genome_multifactory(
        group, pathogen, uploaded_by_user, location, num_county_samples
    )

    selected_samples = pathogen_genomes[:num_selected_samples]
    gisaid_dump = aligned_repo_data_factory(
        pathogen=pathogen,
        repository=repository,
        sequences_s3_key=f"{group_name}{tree_type.value}",
        metadata_s3_key=f"{group_name}{tree_type.value}",
    ).outputs[0]

    inputs = selected_samples + [gisaid_dump]
    session.add_all(inputs)
    if template_args is None:
        template_args = {}

    session.commit()
    return group


def mock_remote_db_uri(mocker, test_postgres_db_uri):
    mocker.patch(
        "aspen.config.config.Config.DATABASE_URI",
        new_callable=mocker.PropertyMock,
        return_value=test_postgres_db_uri,
    )


# Make sure we're properly creating phylo runs
def test_launch_one(mocker, session, split_client, postgres_database):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    # use option defaults
    template_args = "{}"
    tree_type = "OVERVIEW"
    pathogen = "SC2"
    # return the created phylo run for inspection, skip SFN launch
    dry_run = True

    test_group = create_test_data(session, split_client, 10, 10, 10)
    phylo_run = launch_one(test_group.name, template_args, tree_type, pathogen, dry_run)
    assert phylo_run.group.id == test_group.id
    assert phylo_run.workflow_status == WorkflowStatusType.STARTED
    assert phylo_run.pathogen == pathogen
    assert phylo_run.tree_type == tree_type
    assert phylo_run.template_args == template_args
    assert type(phylo_run.contextual_repository_id) is int


# Make sure we're properly creating phylo runs
def test_launch_all(mocker, session, split_client, postgres_database):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    # use option defaults
    pathogen = "SC2"
    # return the created phylo run for inspection, skip SFN launch
    dry_run = True

    group_ids = set()

    for name in ["alpha", "beta", "gamma"]:
        test_group = create_test_data(
            session, split_client, 10, 10, 10, group_name=f"{name}-group"
        )
        group_ids.add(test_group.id)

    phylo_runs = launch_all(pathogen, dry_run)
    assert len(phylo_runs) == 3

    group_ids_launched = set()
    for phylo_run in phylo_runs:
        assert phylo_run.group_id in group_ids
        group_ids_launched.add(phylo_run.group_id)
        assert phylo_run.workflow_status == WorkflowStatusType.STARTED
        assert phylo_run.pathogen == pathogen
        assert phylo_run.tree_type == TreeType.OVERVIEW
        assert type(phylo_run.template_args) is str
        assert type(phylo_run.contextual_repository_id) is int

    assert group_ids == group_ids_launched
