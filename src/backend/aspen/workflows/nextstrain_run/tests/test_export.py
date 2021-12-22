from io import StringIO
from typing import List

import yaml
from sqlalchemy.sql.expression import and_

from aspen.database.models import Group, Location, TreeType, User, WorkflowStatusType
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.phylo_tree import phylorun_factory
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_multifactory
from aspen.test_infra.models.usergroup import group_factory, user_factory
from aspen.test_infra.models.workflow import aligned_gisaid_dump_factory
from aspen.workflows.nextstrain_run.export import export_run_config


def create_test_data(
    session,
    tree_type: TreeType,
    num_county_samples,  # Total # of samples to associate with a group
    num_selected_samples,  # How many of those samples are workflow inputs
    num_gisaid_samples,  # How many gisaid samples to add to a workflow
    group_name=None,  # Override group name
):
    if not group_name:
        group_name = f"testgroup-{tree_type.value}"
    group: Group = group_factory(name=group_name)
    uploaded_by_user: User = user_factory(
        group, email=f"{tree_type.value}@dh.org", auth0_user_id=tree_type.value
    )
    location = (
        session.query(Location)
        .filter(
            and_(
                Location.region == "North America",
                Location.country == "USA",
                Location.division == group.division,
                Location.location == group.location,
            )
        )
        .one_or_none()
    )
    if not location:
        location: Location = location_factory(
            "North America", "USA", group.division, group.location
        )
    session.add(group)

    gisaid_samples: List[str] = [
        f"fake_gisaid_id{i}" for i in range(num_gisaid_samples)
    ]

    pathogen_genomes = uploaded_pathogen_genome_multifactory(
        group, uploaded_by_user, location, num_county_samples
    )

    selected_samples = pathogen_genomes[:num_selected_samples]
    gisaid_dump = aligned_gisaid_dump_factory(
        sequences_s3_key=tree_type.value, metadata_s3_key=tree_type.value
    ).outputs[0]

    inputs = selected_samples + [gisaid_dump]
    session.add_all(inputs)
    phylo_run = phylorun_factory(
        group,
        inputs=inputs,
        gisaid_ids=gisaid_samples,
        tree_type=tree_type,
        template_args={},
        workflow_status=WorkflowStatusType.STARTED,
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
def test_build_config(mocker, session, postgres_database):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    for tree_type in [
        TreeType.OVERVIEW,
        TreeType.NON_CONTEXTUALIZED,
        TreeType.TARGETED,
    ]:
        phylo_run = create_test_data(session, tree_type, 10, 10, 10)
        sequences, selected, metadata, nextstrain_config = generate_run(phylo_run.id)
        build = nextstrain_config["builds"]["aspen"]
        assert build["subsampling_scheme"] == tree_type.value
        assert build["title"].startswith(tree_type.value.title())
        assert phylo_run.group.location in build["title"]
        assert phylo_run.group.division in build["title"]
        assert build["division"] == phylo_run.group.division
        assert build["location"] == phylo_run.group.location
        assert tree_type.value.lower() in nextstrain_config["files"]["description"]
        assert nextstrain_config["files"]["description"].endswith(".md")
        assert len(sequences.splitlines()) == 20  # 10 county samples @2 lines each
        assert len(metadata.splitlines()) == 11  # 10 samples + 1 header line


# Make sure that configs specific to an Overview tree are working.
def test_overview_config(mocker, session, postgres_database):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    tree_type = TreeType.OVERVIEW
    phylo_run = create_test_data(session, tree_type, 10, 0, 0)
    sequences, selected, metadata, nextstrain_config = generate_run(phylo_run.id)

    phylo_run.group
    subsampling_scheme = nextstrain_config["subsampling"][tree_type.value]

    # Just some placeholder sanity-checks
    assert subsampling_scheme["group"]["max_sequences"] == 2000
    assert (
        subsampling_scheme["group"]["query"]
        == "--query \"(location == '{location}') & (division == '{division}')\""
    )
    assert len(selected.splitlines()) == 0  # No selected sequences
    assert len(metadata.splitlines()) == 11  # 10 samples + 1 header line
    assert len(sequences.splitlines()) == 20  # 10 county samples, @2 lines each


# Make sure that configs specific to a Chicago Overview tree are working.
def test_overview_config_chicago(mocker, session, postgres_database):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    tree_type = TreeType.OVERVIEW
    phylo_run = create_test_data(
        session, tree_type, 10, 0, 0, group_name="Chicago Department of Public Health"
    )
    sequences, selected, metadata, nextstrain_config = generate_run(phylo_run.id)

    phylo_run.group
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
def test_non_contextualized_config(mocker, session, postgres_database):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    tree_type = TreeType.NON_CONTEXTUALIZED
    phylo_run = create_test_data(session, tree_type, 10, 5, 5)
    sequences, selected, metadata, nextstrain_config = generate_run(phylo_run.id)

    subsampling_scheme = nextstrain_config["subsampling"][tree_type.value]

    # Just some placeholder sanity-checks
    assert subsampling_scheme["same_county"]["max_sequences"] == 2000
    assert len(selected.splitlines()) == 10  # 5 gisaid samples + 5 selected samples
    assert len(metadata.splitlines()) == 11  # 10 samples + 1 header line
    assert len(sequences.splitlines()) == 20  # 10 county samples, @2 lines each


# Make sure that configs specific to a Targeted build are working.
def test_targeted_config_simple(mocker, session, postgres_database):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    tree_type = TreeType.TARGETED
    phylo_run = create_test_data(session, tree_type, 10, 5, 5)
    sequences, selected, metadata, nextstrain_config = generate_run(phylo_run.id)

    subsampling_scheme = nextstrain_config["subsampling"][tree_type.value]

    # Just some placeholder sanity-checks
    assert subsampling_scheme["closest"]["max_sequences"] == 100
    assert subsampling_scheme["group"]["max_sequences"] == 25
    assert subsampling_scheme["state"]["max_sequences"] == 25
    assert subsampling_scheme["country"]["max_sequences"] == 25
    assert subsampling_scheme["international"]["max_sequences"] == 25
    assert len(selected.splitlines()) == 10  # 5 gisaid samples + 5 selected samples
    assert len(metadata.splitlines()) == 11  # 10 samples + 1 header line
    assert len(sequences.splitlines()) == 20  # 10 county samples, @2 lines each


# Make sure that configs specific to a Targeted build are working.
def test_targeted_config_large(mocker, session, postgres_database):
    mock_remote_db_uri(mocker, postgres_database.as_uri())

    tree_type = TreeType.TARGETED
    phylo_run = create_test_data(session, tree_type, 200, 110, 10)
    sequences, selected, metadata, nextstrain_config = generate_run(phylo_run.id)

    phylo_run.group
    subsampling_scheme = nextstrain_config["subsampling"][tree_type.value]

    # Just some placeholder sanity-checks
    assert subsampling_scheme["closest"]["max_sequences"] == 120
    assert subsampling_scheme["group"]["max_sequences"] == 30
    assert subsampling_scheme["state"]["max_sequences"] == 30
    assert subsampling_scheme["country"]["max_sequences"] == 30
    assert subsampling_scheme["international"]["max_sequences"] == 30
    assert len(selected.splitlines()) == 120  # 10 gisaid samples + 110 selected samples
    assert len(metadata.splitlines()) == 201  # 200 samples + 1 header line
    assert len(sequences.splitlines()) == 400  # 200 county samples, @2 lines each


def generate_run(phylo_run_id):
    sequences_fh = StringIO()
    selected_fh = StringIO()
    metadata_fh = StringIO()
    builds_file_fh = StringIO()
    export_run_config(
        phylo_run_id, sequences_fh, selected_fh, metadata_fh, builds_file_fh
    )
    return (
        sequences_fh.getvalue(),
        selected_fh.getvalue(),
        metadata_fh.getvalue(),
        yaml.load(builds_file_fh.getvalue(), Loader=yaml.FullLoader),
    )
