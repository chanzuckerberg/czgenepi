from datetime import datetime, timedelta

from aspen.database.models import AlignedRepositoryData, RepositoryAlignmentWorkflow
from aspen.database.models.workflow import WorkflowStatusType


def aligned_repo_data_factory(
    pathogen,
    repository,
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
    workflow = RepositoryAlignmentWorkflow(
        pathogen=pathogen,
        public_repository=repository,
        start_datetime=start_datetime,
        end_datetime=end_datetime,
        workflow_status=WorkflowStatusType.COMPLETED,
        software_versions={},
    )
    aligned_repo_data = AlignedRepositoryData(
        pathogen=pathogen,
        public_repository=repository,
        s3_bucket=s3_bucket,
        sequences_s3_key=sequences_s3_key,
        metadata_s3_key=metadata_s3_key,
    )
    workflow.outputs.append(aligned_repo_data)
    return workflow
