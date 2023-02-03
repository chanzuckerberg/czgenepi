from io import StringIO
from typing import List, Optional

import dateparser
import sqlalchemy as sa
import yaml
from sqlalchemy.sql.expression import and_

from aspen.database.models import (
    Group,
    Location,
    Pathogen,
    PhyloRun,
    TreeType,
    User,
    WorkflowStatusType,
)
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.pathogen import pathogen_factory
from aspen.test_infra.models.phylo_tree import phylorun_factory
from aspen.test_infra.models.repository import random_default_repo_factory
from aspen.test_infra.models.sequences import aligned_pathogen_genome_multifactory
from aspen.test_infra.models.usergroup import group_factory, user_factory
from aspen.test_infra.models.workflow import aligned_repo_data_factory
from aspen.workflows.nextstrain_run.export import export_run_config


def create_test_data(
    session,
    split_client,
    tree_type: TreeType,
    num_county_samples,  # Total # of samples to associate with a group
    num_selected_samples,  # How many of those samples are workflow inputs
    num_gisaid_samples,  # How many gisaid samples to add to a workflow
    group_name=None,  # Override group name
    group_location=None,  # Override group location
    group_division=None,  # Override group division
    template_args=None,  # Send template args
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
        session.query(Pathogen).filter(Pathogen.slug == "MPX").one_or_none()
    )
    if not pathogen:
        pathogen = pathogen_factory("MPX", "Monkeypox")
    session.add(group)

    gisaid_samples: List[str] = [
        f"fake_gisaid_id{i}" for i in range(num_gisaid_samples)
    ]

    pathogen_genomes = aligned_pathogen_genome_multifactory(
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

    phylo_run = phylorun_factory(
        group,
        inputs=inputs,
        gisaid_ids=gisaid_samples,
        tree_type=tree_type,
        template_args=template_args,
        workflow_status=WorkflowStatusType.STARTED,
        pathogen=pathogen,
    )
    session.add(phylo_run)
    session.commit()

    return phylo_run, group.default_tree_location


def mock_remote_db_uri(mocker, test_postgres_db_uri):
    mocker.patch(
        "aspen.config.config.Config.DATABASE_URI",
        new_callable=mocker.PropertyMock,
        return_value=test_postgres_db_uri,
    )


# Make sure that configs specific to an Overview tree are working.
def test_overview_config_no_filters(mocker, session, postgres_database, split_client):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    tree_type = TreeType.OVERVIEW
    phylo_run, location = create_test_data(session, split_client, tree_type, 10, 0, 0)
    sequences, selected, metadata, nextstrain_config = generate_run(phylo_run.id)

    subsampling_scheme = nextstrain_config["subsampling"]

    # Just some placeholder sanity-checks
    assert subsampling_scheme["group"]["subsample-max-sequences"] == 500
    assert (
        subsampling_scheme["group"]["query"]
        == f"(location == '{location.location}') & (division == '{location.division}')"
    )
    assert "min-date" not in subsampling_scheme["group"]
    assert "max-date" not in subsampling_scheme["group"]
    assert "lineage" not in subsampling_scheme["group"]["query"]
    assert "max-date" not in subsampling_scheme["international_serial_sampling"]
    assert len(selected.splitlines()) == 0  # No selected sequences
    assert len(metadata.splitlines()) == 11  # 10 samples + 1 header line
    assert len(sequences.splitlines()) == 20  # 10 county samples, @2 lines each


# Make sure that configs specific to an Overview tree are working.
def test_overview_config_ondemand(mocker, session, postgres_database, split_client):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    tree_type = TreeType.OVERVIEW
    query = {
        "filter_start_date": "2021-04-30",
        "filter_end_date": "10 days ago",
        "filter_pango_lineages": ["AY", "B.1.116"],
    }
    phylo_run, location = create_test_data(
        session, split_client, tree_type, 10, 5, 5, template_args=query
    )
    sequences, selected, metadata, nextstrain_config = generate_run(phylo_run.id)

    subsampling_scheme = nextstrain_config["subsampling"]

    max_date = dateparser.parse("10 days ago").strftime("%Y-%m-%d")
    # Order does not matter for lineages, just verify matched sets.
    assert subsampling_scheme["group"]["min-date"] == "2021-04-30"
    assert subsampling_scheme["group"]["max-date"] == f"{max_date}"
    assert (
        subsampling_scheme["international_serial_sampling"]["max-date"] == f"{max_date}"
    )
    assert subsampling_scheme["group"]["subsample-max-sequences"] == 500
    filter_pango_lineages = "['" + "', '".join(query["filter_pango_lineages"]) + "']"
    assert (
        subsampling_scheme["group"]["query"]
        == f"(location == '{location.location}') & (division == '{location.division}') & (lineage in {filter_pango_lineages})"
    )
    assert len(selected.splitlines()) == 10  # 5 gisaid samples + 5 selected samples
    assert len(metadata.splitlines()) == 11  # 10 samples + 1 header line
    assert len(sequences.splitlines()) == 20  # 10 county samples, @2 lines each


# Make sure that configs specific to a Chicago Overview tree are working.
def test_overview_config_chicago(mocker, session, postgres_database, split_client):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    tree_type = TreeType.OVERVIEW
    phylo_run, location = create_test_data(
        session,
        split_client,
        tree_type,
        10,
        0,
        0,
        group_name="Chicago Department of Public Health",
    )
    sequences, selected, metadata, nextstrain_config = generate_run(phylo_run.id)

    subsampling_scheme = nextstrain_config["subsampling"]

    # Make sure our query got updated properly
    assert (
        subsampling_scheme["group"]["query"]
        == f"((location == '{location.location}') & (division == '{location.division}')) | submitting_lab == 'RIPHL at Rush University Medical Center'"
    )
    assert subsampling_scheme["group"]["subsample-max-sequences"] == 500
    assert len(selected.splitlines()) == 0  # No selected sequences
    assert len(metadata.splitlines()) == 11  # 10 samples + 1 header line
    assert len(sequences.splitlines()) == 20  # 10 county samples, @2 lines each


# Make sure that configs specific to a Non-Contextualized tree are working.
def test_non_contextualized_config(mocker, session, postgres_database, split_client):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    tree_type = TreeType.NON_CONTEXTUALIZED
    phylo_run, location = create_test_data(session, split_client, tree_type, 10, 5, 5)
    sequences, selected, metadata, nextstrain_config = generate_run(phylo_run.id)

    subsampling_scheme = nextstrain_config["subsampling"]

    # Just some placeholder sanity-checks
    assert subsampling_scheme["group"]["subsample-max-sequences"] == 1000
    assert len(selected.splitlines()) == 10  # 5 gisaid samples + 5 selected samples
    assert len(metadata.splitlines()) == 11  # 10 samples + 1 header line
    assert len(sequences.splitlines()) == 20  # 10 county samples, @2 lines each


# Make sure that regionalized configs specific to a Non-Contextualized tree are working.
def test_non_contextualized_regions(mocker, session, postgres_database, split_client):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    tree_type = TreeType.NON_CONTEXTUALIZED
    state_phylo_run, state_location = create_test_data(
        session,
        split_client,
        tree_type,
        10,
        5,
        5,
        group_name="Group Without Location",
        group_location="",
    )
    country_phylo_run, country_location = create_test_data(
        session,
        split_client,
        tree_type,
        10,
        5,
        5,
        group_name="Group Without division",
        group_location="",
        group_division="",
    )
    for run_type, run in {
        "state": state_phylo_run,
        "country": country_phylo_run,
    }.items():
        sequences, selected, metadata, nextstrain_config = generate_run(run.id)

        subsampling_scheme = nextstrain_config["subsampling"]

        if run_type == "state":
            assert (
                subsampling_scheme["group"]["query"]
                == f"(division == '{state_location.division}') & (country == '{state_location.country}')"
            )
        else:
            assert (
                subsampling_scheme["group"]["query"]
                == f"(country == '{country_location.country}')"
            )

        # Just some placeholder sanity-checks
        assert subsampling_scheme["group"]["subsample-max-sequences"] == 1000
        assert len(selected.splitlines()) == 10  # 5 gisaid samples + 5 selected samples
        assert len(metadata.splitlines()) == 11  # 10 samples + 1 header line
        assert len(sequences.splitlines()) == 20  # 10 county samples, @2 lines each


# Make sure that configs specific to a Targeted build are working.
def test_targeted_config_simple(mocker, session, postgres_database, split_client):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    tree_type = TreeType.TARGETED
    phylo_run, location = create_test_data(session, split_client, tree_type, 10, 5, 5)
    sequences, selected, metadata, nextstrain_config = generate_run(phylo_run.id)

    subsampling_scheme = nextstrain_config["subsampling"]

    # Just some placeholder sanity-checks
    assert subsampling_scheme["closest"]["subsample-max-sequences"] == 100
    assert subsampling_scheme["group"]["subsample-max-sequences"] == 50
    assert subsampling_scheme["state"]["subsample-max-sequences"] == 50
    assert subsampling_scheme["country"]["subsample-max-sequences"] == 25
    assert subsampling_scheme["international"]["subsample-max-sequences"] == 25
    assert len(selected.splitlines()) == 10  # 5 gisaid samples + 5 selected samples
    assert len(metadata.splitlines()) == 11  # 10 samples + 1 header line
    assert len(sequences.splitlines()) == 20  # 10 county samples, @2 lines each


# Make sure that configs specific to a Targeted build are working.
def test_targeted_config_regions(mocker, session, postgres_database, split_client):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    tree_type = TreeType.TARGETED
    state_phylo_run, state_location = create_test_data(
        session,
        split_client,
        tree_type,
        10,
        5,
        5,
        group_name="Group Without Location",
        group_location="",
    )
    country_phylo_run, country_location = create_test_data(
        session,
        split_client,
        tree_type,
        10,
        5,
        5,
        group_name="Group Without division",
        group_location="",
        group_division="",
    )
    for run_type, run in {
        "state": state_phylo_run,
        "country": country_phylo_run,
    }.items():
        sequences, selected, metadata, nextstrain_config = generate_run(run.id)

        subsampling_scheme = nextstrain_config["subsampling"]

        if run_type == "state":
            assert "state" not in subsampling_scheme.keys()
            assert (
                subsampling_scheme["group"]["query"]
                == f"(division == '{state_location.division}') & (country == '{state_location.country}')"
            )
        else:
            assert "state" not in subsampling_scheme.keys()
            assert "country" not in subsampling_scheme.keys()
            assert (
                subsampling_scheme["group"]["query"]
                == f"(country == '{country_location.country}')"
            )

        # Just some placeholder sanity-checks
        assert subsampling_scheme["closest"]["subsample-max-sequences"] == 100
        assert subsampling_scheme["group"]["subsample-max-sequences"] == 50
        assert subsampling_scheme["international"]["subsample-max-sequences"] == 100
        assert len(selected.splitlines()) == 10  # 5 gisaid samples + 5 selected samples
        assert len(metadata.splitlines()) == 11  # 10 samples + 1 header line
        assert len(sequences.splitlines()) == 20  # 10 county samples, @2 lines each


# Test that we can reset status to STARTED on export.
def test_reset_status(mocker, session, postgres_database, split_client):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    test_table = [
        {"should_reset": False, "result_status": WorkflowStatusType.FAILED},
        {"should_reset": True, "result_status": WorkflowStatusType.STARTED},
    ]
    tree_type = TreeType.TARGETED
    phylo_run, location = create_test_data(
        session, split_client, tree_type, 200, 110, 10
    )
    for test in test_table:
        phylo_run.workflow_status = WorkflowStatusType.FAILED
        session.commit()
        sequences, selected, metadata, nextstrain_config = generate_run(
            phylo_run.id, test["should_reset"]
        )
        session.expire_all()
        run = (
            session.execute(sa.select(PhyloRun).where(PhyloRun.id == phylo_run.id))
            .scalars()
            .one()
        )
        assert run.workflow_status == test["result_status"]


# Make sure that configs specific to a Targeted build are working.
def test_targeted_config_large(mocker, session, postgres_database, split_client):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    tree_type = TreeType.TARGETED
    phylo_run, location = create_test_data(
        session, split_client, tree_type, 200, 110, 10
    )
    sequences, selected, metadata, nextstrain_config = generate_run(phylo_run.id)

    subsampling_scheme = nextstrain_config["subsampling"]

    # Just some placeholder sanity-checks
    assert subsampling_scheme["closest"]["subsample-max-sequences"] == 120
    assert subsampling_scheme["group"]["subsample-max-sequences"] == 60
    assert subsampling_scheme["state"]["subsample-max-sequences"] == 60
    assert subsampling_scheme["country"]["subsample-max-sequences"] == 30
    assert subsampling_scheme["international"]["subsample-max-sequences"] == 30
    assert len(selected.splitlines()) == 120  # 10 gisaid samples + 110 selected samples
    assert len(metadata.splitlines()) == 201  # 200 samples + 1 header line
    assert len(sequences.splitlines()) == 400  # 200 county samples, @2 lines each


def generate_run(phylo_run_id, reset_status=False):
    sequences_fh = StringIO()
    selected_fh = StringIO()
    metadata_fh = StringIO()
    resolved_template_args_fh = StringIO()
    builds_file_fh = StringIO()
    export_run_config(
        phylo_run_id,
        "aligned",
        sequences_fh,
        selected_fh,
        metadata_fh,
        resolved_template_args_fh,
        builds_file_fh,
        reset_status,
    )
    return (
        sequences_fh.getvalue(),
        selected_fh.getvalue(),
        metadata_fh.getvalue(),
        yaml.load(builds_file_fh.getvalue(), Loader=yaml.FullLoader),
    )


# Make sure that state-level builds are working
def test_overview_config_division(mocker, session, postgres_database, split_client):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    tree_type = TreeType.OVERVIEW
    phylo_run, location = create_test_data(
        session,
        split_client,
        tree_type,
        10,
        0,
        0,
        group_name="Group Without Location",
        group_location="",
    )
    sequences, selected, metadata, nextstrain_config = generate_run(phylo_run.id)
    subsampling_scheme = nextstrain_config["subsampling"]

    # Make sure our query got updated properly
    assert subsampling_scheme["country"]["subsample-max-sequences"] == 800
    assert subsampling_scheme["international"]["subsample-max-sequences"] == 200
    assert "state" not in subsampling_scheme.keys()
    assert (
        subsampling_scheme["group"]["query"]
        == f"(division == '{location.division}') & (country == '{location.country}')"
    )


# Make sure that country-level builds are working.
def test_overview_config_country(mocker, session, postgres_database, split_client):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    tree_type = TreeType.OVERVIEW
    phylo_run, location = create_test_data(
        session,
        split_client,
        tree_type,
        10,
        0,
        0,
        group_name="Group Without Location or Country",
        group_location="",
        group_division="",
    )
    sequences, selected, metadata, nextstrain_config = generate_run(phylo_run.id)
    subsampling_scheme = nextstrain_config["subsampling"]

    # Make sure our query got updated properly
    assert "state" not in subsampling_scheme.keys()
    assert "country" not in subsampling_scheme.keys()
    assert subsampling_scheme["international"]["subsample-max-sequences"] == 1000
    assert subsampling_scheme["group"]["query"] == f"(country == '{location.country}')"


# make sure we handle quotes sanely!!!
def test_string_escapes(mocker, session, postgres_database, split_client):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    tree_type = TreeType.NON_CONTEXTUALIZED
    run, location = create_test_data(
        session,
        split_client,
        tree_type,
        10,
        5,
        5,
        group_name="Group Without Location",
        group_location="Cote d'Ivoire",
        group_division="A'Zaz",
    )
    sequences, selected, metadata, nextstrain_config = generate_run(run.id)
    subsampling_scheme = nextstrain_config["subsampling"]
    assert (
        subsampling_scheme["group"]["query"]
        == "(location == 'Cote d\\'Ivoire') & (division == 'A\\'Zaz')"
    )

    # Just some placeholder sanity-checks
    assert subsampling_scheme["group"]["subsample-max-sequences"] == 1000
    assert len(selected.splitlines()) == 10  # 5 gisaid samples + 5 selected samples
    assert len(metadata.splitlines()) == 11  # 10 samples + 1 header line
    assert len(sequences.splitlines()) == 20  # 10 county samples, @2 lines each
