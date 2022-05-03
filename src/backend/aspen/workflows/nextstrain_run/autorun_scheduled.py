import datetime
import json
import os
import re
from copy import deepcopy
from typing import Dict, MutableSequence

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
from aspen.database.models import Group

SCHEDULED_TREE_TYPE = "OVERVIEW"

TEMPLATE_ARGS = {"filter_start_date": "12 weeks ago", "filter_end_date": "now"}


def launch_scheduled_run(aws_client, sfn_params: Dict, group: Group):
    start_datetime = datetime.datetime.now()

    sfn_params["Input"]["Run"] |= {
        "group_name": group.name,
        "s3_filestem": f"{group.prefix}/scheduled",
        "template_args": json.dumps(TEMPLATE_ARGS),
        "tree_type": SCHEDULED_TREE_TYPE,
    }

    # It's important to make "OutputPrefix" unique because the s3 location is used by
    # our WDL runner (miniwdl) as a storage area for files generated by the run,
    # so the prefix must be unique per run to prevent collisions.
    sfn_params[
        "OutputPrefix"
    ] = f'{sfn_params["OutputPrefix"]}/{group.name}/{start_datetime}'

    execution_name = f"{group.prefix}-scheduled-nextstrain-{str(start_datetime)}"
    execution_name = re.sub(r"[^0-9a-zA-Z-]", r"-", execution_name)

    aws_client.start_execution(
        stateMachineArn=sfn_params["StateMachineArn"],  # SWIPE ARN
        name=execution_name,
        input=json.dumps(sfn_params),
    )


@click.command("launch_all")
def launch_all():
    aws_region = os.environ.get("AWS_REGION")
    aws_session = Session(region_name=aws_region)
    sfn_client = aws_session.client(
        service_name="stepfunctions",
        endpoint_url=os.getenv("BOTO_ENDPOINT_URL") or None,
    )

    ssm_client = aws_session.client(
        service_name="ssm",
        endpoint_url=os.getenv("BOTO_ENDPOINT_URL") or None,
    )
    dev_prefix = os.environ.get("REMOTE_DEV_PREFIX")
    deployment_stage = os.environ.get("DEPLOYMENT_STAGE")
    stack_prefix = dev_prefix if dev_prefix else f"/{deployment_stage}stack"

    parameter_path = f"/genepi/{deployment_stage}{stack_prefix}/nextstrain-sfn"
    try:
        get_parameter = ssm_client.get_parameter(Name=parameter_path)
    except ClientError as e:
        raise e
    else:
        param_value = get_parameter["Parameter"]["Value"]
    sfn_params = json.loads(param_value)

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
                launch_scheduled_run(sfn_client, deepcopy(sfn_params), group)


if __name__ == "__main__":
    launch_all()
