import datetime
import json
import os
import re
from typing import MutableSequence

import click
import sqlalchemy as sa
from boto3 import Session

from aspen.api.settings import Settings
from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import Group

EXCLUDED_GROUP_NAMES = [
    "ASPEN ADMIN GROUP",
    "Bot Users",
    "CZI",
    "OneTrust Bot Sandbox",
    "admin",
    "DEMO ACCOUNT",
    "GENEPI ADMIN GROUP",
    "External Demo Group",
]

SCHEDULED_TREE_TYPE = "OVERVIEW"

TEMPLATE_ARGS = {"filter_start_date": "12 weeks ago", "filter_end_date": "now"}


def launch_scheduled_run(aws_client, settings: Settings, group: Group):
    # use scheduled nextstrain wdl, fill in the required details
    settings.AWS_NEXTSTRAIN_SFN_PARAMETERS
    sfn_input_json = {
        "Input": {
            "Run": {
                "genepi_config_secret_name": os.environ.get(
                    "GENEPI_CONFIG_SECRET_NAME", "genepi-config"
                ),
                "aws_region": settings.AWS_REGION,
                "docker_image_id": settings.NEXTSTRAIN_DOCKER_IMAGE_ID,
                "remote_dev_prefix": os.getenv("REMOTE_DEV_PREFIX"),
                "group_name": group.name,
                "s3_filestem": f"{group.location}/scheduled",
                "template_args": json.dumps(TEMPLATE_ARGS),
                "tree_type": SCHEDULED_TREE_TYPE,
            },
        },
        "RUN_WDL_URI": settings.NEXTSTRAIN_SCHEDULED_RUN_WDL_URI,
        "RunEC2Memory": settings.NEXTSTRAIN_EC2_MEMORY,
        "RunEC2Vcpu": settings.NEXTSTRAIN_EC2_VCPU,
        "RunSPOTMemory": settings.NEXTSTRAIN_SPOT_MEMORY,
        "RunSPOTVcpu": settings.NEXTSTRAIN_SPOT_VCPU,
    }

    start_datetime = datetime.datetime.now()

    execution_name = f"{group.prefix}-scheduled-nextstrain-{str(start_datetime)}"
    execution_name = re.sub(r"[^0-9a-zA-Z-]", r"-", execution_name)

    aws_client.start_execution(
        stateMachineArn=settings.NEXTSTRAIN_SCHEDULED_STATE_MACHINE_ARN,  # SWIPE ARN
        name=execution_name,
        input=json.dumps(sfn_input_json),
    )
    print(f"{group.name}: ", sfn_input_json)


@click.command("launch_all")
def launch_all():
    settings = Settings()  # no app state stashed

    aws_region = settings.AWS_REGION
    aws_session = Session(region_name=aws_region)
    client = aws_session.client(
        service_name="stepfunctions",
        endpoint_url=os.getenv("BOTO_ENDPOINT_URL") or None,
    )

    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))
    with session_scope(interface) as db:
        all_groups_query = sa.select(Group).filter(
            Group.name.not_in(EXCLUDED_GROUP_NAMES)
        )
        all_groups: MutableSequence[Group] = (
            db.execute(all_groups_query).scalars().all()
        )
        print(all_groups)
        for group in all_groups:
            schedule_expression = group.tree_parameters.get("schedule_expression", None)
            if schedule_expression is None or datetime.date.today().weekday() in schedule_expression:
                launch_scheduled_run(client, settings, group)


if __name__ == "__main__":
    launch_all()
