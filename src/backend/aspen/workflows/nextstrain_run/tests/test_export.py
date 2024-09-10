import csv
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
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_multifactory
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
    sc2: Optional[Pathogen] = (
        session.query(Pathogen).filter(Pathogen.slug == "SC2").one_or_none()
    )
    if not sc2:
        sc2 = pathogen_factory("SC2", "SARS-CoV-2")
    mpx: Optional[Pathogen] = (
        session.query(Pathogen).filter(Pathogen.slug == "MPX").one_or_none()
    )
    if not mpx:
        mpx = pathogen_factory("MPX", "Mpox")
    session.add(group)

    gisaid_samples: List[str] = [
        f"fake_gisaid_id{i}" for i in range(num_gisaid_samples)
    ]

    sc2_genomes = uploaded_pathogen_genome_multifactory(
        group, sc2, uploaded_by_user, location, num_county_samples
    )
    mpx_genomes = uploaded_pathogen_genome_multifactory(
        group, mpx, uploaded_by_user, location, num_county_samples, num_county_samples
    )

    pathogen = sc2
    selected_samples = sc2_genomes[:num_selected_samples]

    gisaid_dump = aligned_repo_data_factory(
        pathogen=pathogen,
        repository=repository,
        sequences_s3_key=f"{group_name}{tree_type.value}",
        metadata_s3_key=f"{group_name}{tree_type.value}",
    ).outputs[0]

    inputs = selected_samples + [gisaid_dump]
    session.add_all(sc2_genomes + mpx_genomes + [gisaid_dump])
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
        contextual_repository=repository,
    )
    session.add(phylo_run)
    session.commit()

    return phylo_run


def mock_remote_db_uri(mocker, test_postgres_db_uri):
    mocker.patch(
        "aspen.config.config.Config.DATABASE_URI",
        new_callable=mocker.PropertyMock,
        return_value=test_postgres_db_uri,
    )


# Make sure the build config is working properly, and our location/group info is populated.
def test_build_config(mocker, session, split_client, postgres_database):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    for tree_type in [
        TreeType.OVERVIEW,
        TreeType.NON_CONTEXTUALIZED,
        TreeType.TARGETED,
    ]:
        phylo_run = create_test_data(session, split_client, tree_type, 10, 10, 10)
        sequences, selected, metadata, nextstrain_config = generate_run(phylo_run.id)
        build = nextstrain_config["builds"]["aspen"]
        assert build["subsampling_scheme"] == tree_type.value
        assert build["title"].startswith(tree_type.value.title())
        assert phylo_run.group.default_tree_location.location in build["title"]
        assert phylo_run.group.default_tree_location.division in build["title"]
        assert build["division"] == phylo_run.group.default_tree_location.division
        assert build["location"] == phylo_run.group.default_tree_location.location
        assert tree_type.value.lower() in nextstrain_config["files"]["description"]
        assert nextstrain_config["files"]["description"].endswith(".md")
        assert len(sequences.splitlines()) == 20  # 10 county samples @2 lines each
        assert len(metadata.splitlines()) == 11  # 10 samples + 1 header line
        # Test that we are careful with printing data from our models
        metadata_reader = csv.DictReader(StringIO(metadata), delimiter="\t")
        for row in metadata_reader:
            for key, value in row.items():
                assert not value.startswith("<aspen.database.models")
                if key == "isl":
                    assert value.startswith("EPI_ISL_")


# Make sure that configs specific to an Overview tree are working.
def test_overview_config_no_filters(mocker, session, postgres_database, split_client):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    tree_type = TreeType.OVERVIEW
    phylo_run = create_test_data(session, split_client, tree_type, 10, 0, 0)
    sequences, selected, metadata, nextstrain_config = generate_run(phylo_run.id)

    subsampling_scheme = nextstrain_config["subsampling"][tree_type.value]

    # Just some placeholder sanity-checks
    assert "include" not in nextstrain_config["files"]
    assert subsampling_scheme["group"]["max_sequences"] == 2000
    assert (
        subsampling_scheme["group"]["query"]
        == "--query \"(location == '{location}') & (division == '{division}')\""
    )
    assert "min_date" not in subsampling_scheme["group"]
    assert "max_date" not in subsampling_scheme["group"]
    assert "pango_lineage" not in subsampling_scheme["group"]["query"]
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
    phylo_run = create_test_data(
        session, split_client, tree_type, 10, 5, 5, template_args=query
    )
    sequences, selected, metadata, nextstrain_config = generate_run(phylo_run.id)

    subsampling_scheme = nextstrain_config["subsampling"][tree_type.value]

    max_date = dateparser.parse("10 days ago").strftime("%Y-%m-%d")
    assert nextstrain_config["files"]["include"] == "data/include.txt"
    # Order does not matter for lineages, just verify matched sets.
    assert set(nextstrain_config["builds"]["aspen"]["pango_lineage"]) == set(
        query["filter_pango_lineages"]
    )
    assert subsampling_scheme["group"]["min_date"] == "--min-date 2021-04-30"
    assert subsampling_scheme["group"]["max_date"] == f"--max-date {max_date}"
    assert (
        subsampling_scheme["international_serial_sampling"]["max_date"]
        == f"--max-date {max_date}"
    )
    assert subsampling_scheme["group"]["max_sequences"] == 2000
    assert (
        subsampling_scheme["group"]["query"]
        == "--query \"(location == '{location}') & (division == '{division}') & (pango_lineage in {pango_lineage})\""
    )
    assert len(selected.splitlines()) == 10  # 5 gisaid samples + 5 selected samples
    assert len(metadata.splitlines()) == 11  # 10 samples + 1 header line
    assert len(sequences.splitlines()) == 20  # 10 county samples, @2 lines each


# Make sure that we can filter non-contextualized trees
def test_non_contextualized_config_filters(
    mocker, session, postgres_database, split_client
):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    tree_type = TreeType.NON_CONTEXTUALIZED
    query = {
        "filter_start_date": "2021-04-30",
        "filter_end_date": "10 days ago",
        "filter_pango_lineages": ["AY", "B.1.116"],
    }
    phylo_run = create_test_data(
        session, split_client, tree_type, 10, 5, 5, template_args=query
    )
    sequences, selected, metadata, nextstrain_config = generate_run(phylo_run.id)

    subsampling_scheme = nextstrain_config["subsampling"][tree_type.value]

    max_date = dateparser.parse("10 days ago").strftime("%Y-%m-%d")
    assert nextstrain_config["files"]["include"] == "data/include.txt"
    # Order does not matter for lineages, just verify matched sets.
    assert set(nextstrain_config["builds"]["aspen"]["pango_lineage"]) == set(
        query["filter_pango_lineages"]
    )
    assert subsampling_scheme["group"]["min_date"] == "--min-date 2021-04-30"
    assert subsampling_scheme["group"]["max_date"] == f"--max-date {max_date}"
    assert subsampling_scheme["group"]["max_sequences"] == 2000
    assert (
        subsampling_scheme["group"]["query"]
        == "--query \"(location == '{location}') & (division == '{division}') & (pango_lineage in {pango_lineage})\""
    )
    assert len(selected.splitlines()) == 10  # 5 gisaid samples + 5 selected samples
    assert len(metadata.splitlines()) == 11  # 10 samples + 1 header line
    assert len(sequences.splitlines()) == 20  # 10 county samples, @2 lines each


# Make sure that configs specific to a Chicago Overview tree are working.
def test_overview_config_chicago(mocker, session, postgres_database, split_client):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    tree_type = TreeType.OVERVIEW
    phylo_run = create_test_data(
        session,
        split_client,
        tree_type,
        10,
        0,
        0,
        group_name="Chicago Department of Public Health",
    )
    sequences, selected, metadata, nextstrain_config = generate_run(phylo_run.id)

    subsampling_scheme = nextstrain_config["subsampling"][tree_type.value]

    # Make sure our query got updated properly
    assert (
        subsampling_scheme["group"]["query"]
        == "--query \"((location == '{location}') & (division == '{division}')) | submitting_lab == 'RIPHL at Rush University Medical Center'\""
    )
    assert subsampling_scheme["group"]["max_sequences"] == 2000
    assert len(selected.splitlines()) == 0  # No selected sequences
    assert len(metadata.splitlines()) == 11  # 10 samples + 1 header line
    assert len(sequences.splitlines()) == 20  # 10 county samples, @2 lines each


# Make sure that configs specific to a Non-Contextualized tree are working.
def test_non_contextualized_config(mocker, session, postgres_database, split_client):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    tree_type = TreeType.NON_CONTEXTUALIZED
    phylo_run = create_test_data(session, split_client, tree_type, 10, 5, 5)
    sequences, selected, metadata, nextstrain_config = generate_run(phylo_run.id)

    subsampling_scheme = nextstrain_config["subsampling"][tree_type.value]

    # Just some placeholder sanity-checks
    assert subsampling_scheme["group"]["max_sequences"] == 2000
    assert len(selected.splitlines()) == 10  # 5 gisaid samples + 5 selected samples
    assert len(metadata.splitlines()) == 11  # 10 samples + 1 header line
    assert len(sequences.splitlines()) == 20  # 10 county samples, @2 lines each


# Make sure that regionalized configs specific to a Non-Contextualized tree are working.
def test_non_contextualized_regions(mocker, session, postgres_database, split_client):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    tree_type = TreeType.NON_CONTEXTUALIZED
    state_phylo_run = create_test_data(
        session,
        split_client,
        tree_type,
        10,
        5,
        5,
        group_name="Group Without Location",
        group_location="",
    )
    country_phylo_run = create_test_data(
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

        subsampling_scheme = nextstrain_config["subsampling"][tree_type.value]

        if run_type == "state":
            assert (
                subsampling_scheme["group"]["query"]
                == '''--query "(division == '{division}') & (country == '{country}')"'''
            )
        else:
            assert (
                subsampling_scheme["group"]["query"]
                == '''--query "(country == '{country}')"'''
            )

        # Just some placeholder sanity-checks
        assert subsampling_scheme["group"]["max_sequences"] == 2000
        assert len(selected.splitlines()) == 10  # 5 gisaid samples + 5 selected samples
        assert len(metadata.splitlines()) == 11  # 10 samples + 1 header line
        assert len(sequences.splitlines()) == 20  # 10 county samples, @2 lines each


# Make sure that configs specific to a Targeted build are working.
def test_targeted_config_simple(mocker, session, postgres_database, split_client):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    tree_type = TreeType.TARGETED
    phylo_run = create_test_data(session, split_client, tree_type, 10, 5, 5)
    sequences, selected, metadata, nextstrain_config = generate_run(phylo_run.id)

    subsampling_scheme = nextstrain_config["subsampling"][tree_type.value]

    # Just some placeholder sanity-checks
    assert subsampling_scheme["closest"]["max_sequences"] == 250
    assert subsampling_scheme["group"]["max_sequences"] == 50
    assert subsampling_scheme["state"]["max_sequences"] == 50
    assert subsampling_scheme["country"]["max_sequences"] == 25
    assert subsampling_scheme["international"]["max_sequences"] == 25
    assert len(selected.splitlines()) == 10  # 5 gisaid samples + 5 selected samples
    assert len(metadata.splitlines()) == 11  # 10 samples + 1 header line
    assert len(sequences.splitlines()) == 20  # 10 county samples, @2 lines each


# Make sure that configs specific to a Targeted build are working.
def test_targeted_config_regions(mocker, session, postgres_database, split_client):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    tree_type = TreeType.TARGETED
    state_phylo_run = create_test_data(
        session,
        split_client,
        tree_type,
        10,
        5,
        5,
        group_name="Group Without Location",
        group_location="",
    )
    country_phylo_run = create_test_data(
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

        subsampling_scheme = nextstrain_config["subsampling"][tree_type.value]

        if run_type == "state":
            assert "state" not in subsampling_scheme.keys()
            assert (
                subsampling_scheme["group"]["query"]
                == '''--query "(division == '{division}') & (country == '{country}')"'''
            )
        else:
            assert "state" not in subsampling_scheme.keys()
            assert "country" not in subsampling_scheme.keys()
            assert (
                subsampling_scheme["group"]["query"]
                == '''--query "(country == '{country}')"'''
            )

        # Just some placeholder sanity-checks
        assert subsampling_scheme["closest"]["max_sequences"] == 250
        assert subsampling_scheme["group"]["max_sequences"] == 50
        assert subsampling_scheme["international"]["max_sequences"] == 100
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
    phylo_run = create_test_data(session, split_client, tree_type, 200, 110, 10)
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
    phylo_run = create_test_data(session, split_client, tree_type, 400, 270, 10)
    sequences, selected, metadata, nextstrain_config = generate_run(phylo_run.id)

    subsampling_scheme = nextstrain_config["subsampling"][tree_type.value]

    # Just some placeholder sanity-checks
    assert subsampling_scheme["closest"]["max_sequences"] == 280
    assert subsampling_scheme["group"]["max_sequences"] == 140
    assert subsampling_scheme["state"]["max_sequences"] == 140
    assert subsampling_scheme["country"]["max_sequences"] == 70
    assert subsampling_scheme["international"]["max_sequences"] == 70
    assert len(selected.splitlines()) == 280  # 10 gisaid samples + 270 selected samples
    assert len(metadata.splitlines()) == 401  # 200 samples + 1 header line
    assert len(sequences.splitlines()) == 800  # 200 county samples, @2 lines each


def generate_run(phylo_run_id, reset_status=False):
    sequences_fh = StringIO()
    selected_fh = StringIO()
    metadata_fh = StringIO()
    resolved_template_args_fh = StringIO()
    builds_file_fh = StringIO()
    export_run_config(
        phylo_run_id,
        "uploaded",
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
    phylo_run = create_test_data(
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
    subsampling_scheme = nextstrain_config["subsampling"][tree_type.value]

    # Make sure our query got updated properly
    assert subsampling_scheme["country"]["max_sequences"] == 800
    assert subsampling_scheme["international"]["max_sequences"] == 200
    assert "state" not in subsampling_scheme.keys()
    assert (
        subsampling_scheme["group"]["query"]
        == '''--query "(division == '{division}') & (country == '{country}')"'''
    )


# Make sure that country-level builds are working.
def test_overview_config_country(mocker, session, postgres_database, split_client):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    tree_type = TreeType.OVERVIEW
    phylo_run = create_test_data(
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
    subsampling_scheme = nextstrain_config["subsampling"][tree_type.value]

    # Make sure our query got updated properly
    assert "state" not in subsampling_scheme.keys()
    assert "country" not in subsampling_scheme.keys()
    assert subsampling_scheme["international"]["max_sequences"] == 1000
    assert (
        subsampling_scheme["group"]["query"] == '''--query "(country == '{country}')"'''
    )
