import datetime
from typing import Mapping, Union

from aspen.database.models import PhyloRun, PhyloTree, TreeType, WorkflowStatusType


class _SentinelType:
    ...


_sentinel: _SentinelType = _SentinelType()


def phylorun_factory(
    run_group_owner,
    workflow_status=WorkflowStatusType.COMPLETED,
    start_datetime: Union[datetime.datetime, _SentinelType] = _sentinel,
    end_datetime: Union[datetime.datetime, _SentinelType] = _sentinel,
    software_versions: Union[Mapping[str, str], _SentinelType] = _sentinel,
    template_args: Mapping[str, str] = {},
    tree_type=TreeType.OVERVIEW,
):
    start_datetime = (
        start_datetime
        if not isinstance(start_datetime, _SentinelType)
        else datetime.datetime.now()
    )
    end_datetime = (
        end_datetime
        if not isinstance(end_datetime, _SentinelType)
        else datetime.datetime.now()
    )
    software_versions = (
        software_versions if not isinstance(software_versions, _SentinelType) else {}
    )
    return PhyloRun(
        group=run_group_owner,
        workflow_status=workflow_status,
        start_datetime=start_datetime,
        end_datetime=end_datetime,
        software_versions=software_versions,
        template_args=template_args,
        tree_type=tree_type,
    )


def phylotree_factory(
    phylorun: PhyloRun,
    constituent_samples,
    bucket="test-bucket",
    key="test-key",
) -> PhyloTree:
    return PhyloTree(
        s3_bucket=bucket,
        s3_key=key,
        constituent_samples=constituent_samples,
        producing_workflow=phylorun,
        tree_type=phylorun.tree_type
    )
