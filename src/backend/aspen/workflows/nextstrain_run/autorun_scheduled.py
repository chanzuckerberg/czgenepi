import datetime
import json
import os
import re
from copy import deepcopy
from typing import Dict, MutableSequence
from aspen.api.settings import CLISettings
from aspen.util.swipe import NextstrainJob

import click
import sqlalchemy as sa
from boto3 import Session
from botocore.exceptions import ClientError

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import Group, AlignedGisaidDump, WorkflowStatusType, Workflow, PhyloRun, User, TreeType

SCHEDULED_TREE_TYPE = "OVERVIEW"

TEMPLATE_ARGS = {"filter_start_date": "12 weeks ago", "filter_end_date": "now"}


def create_phylo_run(
    session,
    group: Group,
    template_args: Dict[str, str],
):
    user = session.query(User).filter(User.email == "hello@czgenepi.org").one()
    aligned_gisaid_dump = (
        session.query(AlignedGisaidDump)
        .join(AlignedGisaidDump.producing_workflow)
        .order_by(Workflow.end_datetime.desc())
        .first()
    )

    workflow: PhyloRun = PhyloRun(
        start_datetime=datetime.datetime.now(),
        workflow_status=WorkflowStatusType.STARTED,
        software_versions={},
        group=group,
        tree_type=TreeType("OVERVIEW"),
    )
    workflow.inputs = [aligned_gisaid_dump]
    workflow.template_args = json.loads(template_args)
    workflow.name = f"{group.name} Contextual Recency-Focused Build"
    workflow.user = user

    session.add(workflow)
    return workflow

@click.command("launch_all")
def launch_all():
    settings = CLISettings()

    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))
    with session_scope(interface) as db:
        all_groups_query = sa.select(Group)
        all_groups: MutableSequence[Group] = (
            db.execute(all_groups_query).scalars().all()
        )
        for group in all_groups:
            schedule_expression = group.tree_parameters.get("schedule_expression", None)
            if (
                schedule_expression is None
                or datetime.date.today().weekday() in schedule_expression
            ):
                workflow = create_phylo_run(db, group, TEMPLATE_ARGS)

                job = NextstrainJob(settings)
                db.commit()
                job.run(workflow)


if __name__ == "__main__":
    launch_all()
