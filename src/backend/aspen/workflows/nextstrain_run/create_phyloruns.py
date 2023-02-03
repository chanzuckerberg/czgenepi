import datetime
import json
import re
from typing import Any, Dict, MutableSequence

import click
import dateparser
import sqlalchemy as sa
from sqlalchemy import func
from sqlalchemy.orm import joinedload

from aspen.api.settings import CLISettings
from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import (
    AlignedRepositoryData,
    Group,
    Location,
    Pathogen,
    PhyloRun,
    PublicRepository,
    PublicRepositoryMetadata,
    Sample,
    TreeType,
    User,
    Workflow,
    WorkflowStatusType,
)
from aspen.util.split import SplitClient
from aspen.util.swipe import NextstrainScheduledJob

SCHEDULED_TREE_TYPE = "OVERVIEW"

DEFAULT_TEMPLATE_ARGS = {"filter_start_date": "12 weeks ago", "filter_end_date": "now"}


def create_phylo_run(
    session,
    group: Group,
    template_args: Dict[str, str],
    tree_type: TreeType,
    pathogen: str,
    repository: str,
):

    user = session.query(User).filter(User.email == "hello@czgenepi.org").one()
    aligned_repo_data = (
        session.query(AlignedRepositoryData)
        .join(AlignedRepositoryData.producing_workflow)
        .filter(AlignedRepositoryData.pathogen == pathogen)
        .filter(AlignedRepositoryData.public_repository == repository)
        .order_by(Workflow.end_datetime.desc())
        .first()
    )

    workflow: PhyloRun = PhyloRun(
        start_datetime=datetime.datetime.now(),
        workflow_status=WorkflowStatusType.STARTED,
        software_versions={},
        pathogen=pathogen,
        group=group,
        tree_type=tree_type,
    )
    workflow.inputs = [aligned_repo_data]
    workflow.template_args = template_args
    workflow.name = f"{group.name} Contextual Recency-Focused Build"
    workflow.user = user

    session.add(workflow)
    return workflow


@click.group()
def cli():
    pass


@cli.command("launch")
@click.argument("group", required=True)
@click.option("--template-args", type=str, default="{}")
@click.option("--tree-type", type=str, default="OVERVIEW")
@click.option("--pathogen", type=str, default="SC2")
@click.option("--launch-sfn", is_flag=True, default=False)
def launch_one(
    group: str, template_args: str, tree_type: str, pathogen: str, launch_sfn: bool
):
    # NOTE/TODO - this currently doesn't do any smart input validation, it will just
    # let python raise an exception and explode if anything doesn't make sense.
    tree_type_obj = TreeType(tree_type)
    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))
    settings = CLISettings()
    template_args_obj: Dict[str, Any] = json.loads(template_args)

    split_client = SplitClient(settings)

    with session_scope(interface) as db:
        pathogen_obj = (
            db.execute(sa.select(Pathogen).filter(Pathogen.slug == pathogen))
            .scalars()
            .one()
        )
        default_repository = split_client.get_pathogen_treatment(
            "PATHOGEN_public_repository", pathogen_obj
        )
        repository = (
            db.execute(
                sa.select(PublicRepository).filter(
                    PublicRepository.name == default_repository
                )
            )
            .scalars()
            .one()
        )

        if re.match(r"^[0-9]+$", group):
            where_clause = Group.id == int(group)
        else:
            where_clause = Group.name == group
        groups_query = sa.select(Group).where(where_clause)  # type: ignore
        group_obj: Group = db.execute(groups_query).scalars().one()
        workflow = create_phylo_run(
            db, group_obj, template_args_obj, tree_type_obj, pathogen_obj, repository
        )

        job = NextstrainScheduledJob(settings)
        db.commit()
        print(workflow.id)
        if launch_sfn:
            job = NextstrainScheduledJob(settings)
            job.run(workflow, "scheduled")


def retry_template_args_for_focal_group(
    db,
    group: Group,
    pathogen: Pathogen,
    repo: PublicRepository,
    filter_start_date: datetime.date,
    filter_end_date: datetime.date,
):
    args = {}
    location = group.default_tree_location
    location_hierarchy = ["region", "country", "division", "location"]
    # Keep track of what our initial group hierarchy level is.
    current_location_level = []
    for level in location_hierarchy:
        if getattr(location, level):
            current_location_level.append(level)
    start_date_attempts = ["6 months ago", "12 months ago"]

    while True:
        print(
            f"Checking for focal samples for group '{group.name}' in '{location.region}/{location.country}/{location.division}/{location.location}', newer than {filter_start_date} ... ",
            end="",
        )
        args = get_template_args_for_focal_group(
            db, group, pathogen, repo, location, filter_start_date, filter_end_date
        )
        if args:
            print("match found")
            return args
        print("no matches, trying again")

        # Try going back further in time.
        if start_date_attempts:
            filter_start_date = dateparser.parse(start_date_attempts.pop(0)).date()
            # We overwrote the start date to look further back in time, let's try again!
            continue

        # widen our geographical search area
        if (
            "division" in current_location_level
        ):  # We don't build scheduled trees for locations bigger than a country.
            current_location_level = current_location_level[:-1]
            new_location_query = sa.select(Location)
            for col in location_hierarchy:
                col_match = None
                if col in current_location_level:
                    col_match = getattr(location, col)
                new_location_query = new_location_query.where(
                    getattr(Location, col) == col_match
                )
            location = db.execute(new_location_query).scalars().one()
            # We overwrote the location var with a wider area. Try again!
            continue

        # If we've made it this far, we have no more options, skip the build..
        return None


def get_template_args_for_focal_group(
    db,
    group: Group,
    pathogen: Pathogen,
    repo: PublicRepository,
    location: Location,
    filter_start_date: datetime.date,
    filter_end_date: datetime.date,
):
    template_args = {
        "location_id": location.id,
        "filter_start_date": filter_start_date.strftime("%Y-%m-%d"),
        "filter_end_date": filter_end_date.strftime("%Y-%m-%d"),
    }

    # If this group has uploaded samples within our start/end dates, we're all set.
    group_samples = db.execute(
        sa.select([func.count()])
        .select_from(Sample)
        .where(
            Sample.pathogen == pathogen,
            Sample.submitting_group == group,
            Sample.collection_date >= filter_start_date,
            Sample.collection_date <= filter_end_date,
        )
    ).scalar()
    if group_samples:
        return template_args

    # Even if the group hasn't uploaded samples, we can proceed if anyone's uploaded
    # data to gisaid for their default tree location.
    upstream_samples_query = (
        sa.select([func.count()])
        .select_from(PublicRepositoryMetadata)
        .where(
            PublicRepositoryMetadata.region == location.region,
            PublicRepositoryMetadata.country == location.country,
            PublicRepositoryMetadata.pathogen == pathogen,
            PublicRepositoryMetadata.public_repository == repo,
            PublicRepositoryMetadata.date >= filter_start_date,
            PublicRepositoryMetadata.date <= filter_end_date,
        )
    )
    if location.location:
        upstream_samples_query = upstream_samples_query.where(
            PublicRepositoryMetadata.location == location.location,
        )
    if location.division:
        upstream_samples_query = upstream_samples_query.where(
            PublicRepositoryMetadata.division == location.division,
        )
    upstream_samples = db.execute(upstream_samples_query).scalar()
    if upstream_samples:
        return template_args
    return None


@cli.command("launch-all")
@click.option("--pathogen", type=str, default="SC2")
def launch_all(pathogen):
    settings = CLISettings()

    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))
    tree_type = TreeType("OVERVIEW")
    split_client = SplitClient(settings)
    with session_scope(interface) as db:
        pathogen_obj = (
            db.execute(sa.select(Pathogen).filter(Pathogen.slug == pathogen))
            .scalars()
            .one()
        )
        default_repository = split_client.get_pathogen_treatment(
            "PATHOGEN_public_repository", pathogen_obj
        )
        repository = (
            db.execute(
                sa.select(PublicRepository).filter(
                    PublicRepository.name == default_repository
                )
            )
            .scalars()
            .one()
        )

        all_groups_query = sa.select(Group).options(
            joinedload(Group.default_tree_location)
        )
        all_groups: MutableSequence[Group] = (
            db.execute(all_groups_query).scalars().all()
        )
        for group in all_groups:
            schedule_expression = group.tree_parameters.get("schedule_expression", None)
            if (
                schedule_expression is None
                or datetime.date.today().weekday() in schedule_expression
            ):
                template_args = retry_template_args_for_focal_group(
                    db,
                    group,
                    pathogen_obj,
                    repository,
                    dateparser.parse(DEFAULT_TEMPLATE_ARGS["filter_start_date"]).date(),
                    dateparser.parse(DEFAULT_TEMPLATE_ARGS["filter_end_date"]).date(),
                )
                if not template_args:
                    print(
                        f"Could not find any focal samples for group {group.name}, skipping!"
                    )
                    continue
                workflow = create_phylo_run(
                    db, group, template_args, tree_type, pathogen_obj, repository
                )

                job = NextstrainScheduledJob(settings)
                db.commit()
                job.run(workflow, "scheduled")


if __name__ == "__main__":
    cli()
