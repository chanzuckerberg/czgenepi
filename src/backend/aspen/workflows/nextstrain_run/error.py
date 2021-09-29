import datetime
import os

import click

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import PhyloRun
from aspen.database.models.workflow import SoftwareNames, WorkflowStatusType

@click.command("error")
@click.option("--phylo-run-id", type=int, required=True)
@click.option("--ncov-rev", type=str, required=False)
@click.option("--end-time", type=int, required=True)
def fail_run(
    ncov_rev: str,
    end_time: int,
    phylo_run_id: int,
):
    print("I have been triggered because an error has been detected in this run.")
    end_time_datetime = datetime.datetime.fromtimestamp(end_time)

    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))
    with session_scope(interface) as session:
        phylo_run: PhyloRun = (
            session.query(PhyloRun)
            .filter(PhyloRun.workflow_id == phylo_run_id)
            .one_or_none()
        )

        assert phylo_run.workflow_status != WorkflowStatusType.COMPLETED

        # update the run object with the metadata about the run and mark failed.
        phylo_run.end_datetime = end_time_datetime
        phylo_run.workflow_status = WorkflowStatusType.FAILED
        phylo_run.software_versions = {
            SoftwareNames.NCOV: ncov_rev,
        }


if __name__ == '__main__':
    fail_run()