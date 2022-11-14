import datetime
import json
import re
from typing import Any, Dict, MutableSequence

import click
import sqlalchemy as sa
from sqlalchemy import func

from aspen.api.settings import CLISettings
from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import (
    AlignedGisaidDump,
    Group,
    Pathogen,
    PhyloRun,
    Sample,
    TreeType,
    User,
    Workflow,
    WorkflowStatusType,
)
from aspen.util.swipe import NextstrainScheduledJob

SCHEDULED_TREE_TYPE = "OVERVIEW"

TEMPLATE_ARGS = {"filter_start_date": "12 weeks ago", "filter_end_date": "now"}

# This needs to match the value for "filter_start_date" in TEMPLATE_ARGS.
FILTER_START_INTERVAL_DAYS = 12 * 7  # 12 weeks ago


def create_phylo_run(
    session,
    group: Group,
    template_args: Dict[str, str],
    tree_type: TreeType,
    pathogen: str,
):
    user = session.query(User).filter(User.email == "hello@czgenepi.org").one()
    aligned_gisaid_dump = (
        session.query(AlignedGisaidDump)
        .join(AlignedGisaidDump.producing_workflow)
        .order_by(Workflow.end_datetime.desc())
        .first()
    )

    pathogen = session.query(Pathogen).filter(Pathogen.slug == pathogen).one()
    workflow: PhyloRun = PhyloRun(
        start_datetime=datetime.datetime.now(),
        workflow_status=WorkflowStatusType.STARTED,
        software_versions={},
        pathogen=pathogen,
        group=group,
        tree_type=tree_type,
    )
    workflow.inputs = [aligned_gisaid_dump]
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
    with session_scope(interface) as db:
        if re.match(r"^[0-9]+$", group):
            where_clause = Group.id == int(group)
        else:
            where_clause = Group.name == group
        groups_query = sa.select(Group).where(where_clause)  # type: ignore
        group_obj: Group = db.execute(groups_query).scalars().one()
        workflow = create_phylo_run(
            db, group_obj, template_args_obj, tree_type_obj, pathogen
        )

        job = NextstrainScheduledJob(settings)
        db.commit()
        print(workflow.id)
        if launch_sfn:
            job = NextstrainScheduledJob(settings)
            job.run(workflow, "scheduled")


@cli.command("launch-all")
@click.option("--pathogen", type=str, default="SC2")
def launch_all(pathogen):
    settings = CLISettings()

    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))
    tree_type = TreeType("OVERVIEW")
    with session_scope(interface) as db:
        all_groups_query = sa.select(Group)
        all_groups: MutableSequence[Group] = (
            db.execute(all_groups_query).scalars().all()
        )
        for group in all_groups:
            schedule_expression = group.tree_parameters.get("schedule_expression", None)
            # Make sure the number of samples collected in the past 12 weeks is > 0
            # Note that in Postgres, date - date = int where the int is
            # the intervening number of days.
            filter_interval_samples_count_query = (
                sa.select(func.count())
                .select_from(Sample)
                .where(
                    Sample.submitting_group_id == group.id,
                    func.current_date() - Sample.collection_date
                    < FILTER_START_INTERVAL_DAYS,
                )
            )
            filter_interval_samples_count: int = (
                db.execute(filter_interval_samples_count_query).scalars().one()
            )
            if (
                schedule_expression is None
                or datetime.date.today().weekday() in schedule_expression
            ) and filter_interval_samples_count > 0:
                workflow = create_phylo_run(
                    db, group, TEMPLATE_ARGS, tree_type, pathogen
                )

                job = NextstrainScheduledJob(settings)
                db.commit()
                job.run(workflow, "scheduled")


if __name__ == "__main__":
    cli()
