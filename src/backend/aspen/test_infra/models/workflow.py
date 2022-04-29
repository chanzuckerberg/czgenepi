from datetime import datetime, timedelta

from aspen.database.models.gisaid_dump import AlignedGisaidDump, GisaidAlignmentWorkflow
from aspen.database.models.workflow import WorkflowStatusType


def aligned_gisaid_dump_factory(
    start_datetime=datetime.now() - timedelta(days=1),
    end_datetime=datetime.now(),
    workflow_status=WorkflowStatusType.COMPLETED,
    software_versions={"test": "v0.0.1"},
    inputs=[],
    outputs=[],
    s3_bucket="s3_bucket",
    sequences_s3_key="sequences_key",
    metadata_s3_key="metadata_key",
):
    workflow = GisaidAlignmentWorkflow(
        start_datetime=start_datetime,
        end_datetime=end_datetime,
        workflow_status=WorkflowStatusType.COMPLETED,
        software_versions={},
    )
    aligned_gisaid_dump = AlignedGisaidDump(
        s3_bucket=s3_bucket,
        sequences_s3_key=sequences_s3_key,
        metadata_s3_key=metadata_s3_key,
    )
    workflow.outputs.append(aligned_gisaid_dump)
    return workflow
