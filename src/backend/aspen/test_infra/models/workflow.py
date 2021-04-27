from datetime import datetime, timedelta

from aspen.database.models.sequences import CallConsensus
from aspen.database.models.workflow import WorkflowStatusType, WorkflowType


def call_consensus_factory(
    workflow_type=WorkflowType.CALL_CONSENSUS,
    start_datetime=datetime.now() - timedelta(days=1),
    end_datetime=datetime.now(),
    workflow_status=WorkflowStatusType.COMPLETED,
    software_versions={"test": "v0.0.1"},
    inputs=[],
    outputs=[],
):
    return CallConsensus(
        workflow_type=workflow_type,
        start_datetime=start_datetime,
        end_datetime=end_datetime,
        workflow_status=workflow_status,
        software_versions=software_versions,
        inputs=inputs,
        outputs=outputs,
    )
