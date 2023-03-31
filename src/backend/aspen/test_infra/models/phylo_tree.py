import datetime
import uuid
from typing import Any, Iterable, Mapping, Union

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
    template_args: Mapping[str, str] = None,
    inputs: Iterable[Any] = None,
    gisaid_ids: Iterable[str] = None,
    tree_type=TreeType.OVERVIEW,
    pathogen=None,
    contextual_repository=None,
):
    if not inputs:
        inputs = []
    if not gisaid_ids:
        gisaid_ids = []
    if not template_args:
        template_args = {}

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
        gisaid_ids=gisaid_ids,
        inputs=inputs,
        tree_type=tree_type,
        pathogen=pathogen,
        contextual_repository=contextual_repository,
    )


def phylotree_factory(
    phylorun: PhyloRun,
    constituent_samples,
    bucket="test-bucket",
    key=None,
) -> PhyloTree:
    if not key:
        key = uuid.uuid4().hex
    return PhyloTree(
        s3_bucket=bucket,
        s3_key=key,
        pathogen=phylorun.pathogen,
        group=phylorun.group,
        constituent_samples=constituent_samples,
        producing_workflow=phylorun,
        tree_type=phylorun.tree_type,
        contextual_repository=phylorun.contextual_repository,
    )
