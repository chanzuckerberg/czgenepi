import datetime
import json
import re
from typing import List, Optional

from boto3 import Session

from aspen.api.settings import Settings
from aspen.database.models import Group, PhyloRun


class SwipeJob:
    def __init__(self, settings: Settings):
        self.settings = settings

    def get_sfn_config(self):
        raise NotImplementedError

    def _start(self, execution_name, output_suffix, extra_params):
        settings = self.settings

        sfn_params = self.get_sfn_config()
        # Step 5 - Kick off the phylo run job.
        sfn_input_json = {
            "Input": {
                "Run": {
                    "aws_region": settings.AWS_REGION,
                    "docker_image_id": sfn_params["Input"]["Run"]["docker_image_id"],
                    "genepi_config_secret_name": settings.GENEPI_CONFIG_SECRET_NAME,
                    "remote_dev_prefix": settings.REMOTE_DEV_PREFIX,
                    **extra_params,
                },
            },
            "OutputPrefix": f"{sfn_params['OutputPrefix']}{output_suffix}",
            "RUN_WDL_URI": sfn_params["RUN_WDL_URI"],
            "RunEC2Memory": sfn_params["RunEC2Memory"],
            "RunEC2Vcpu": sfn_params["RunEC2Vcpu"],
            "RunSPOTMemory": sfn_params["RunSPOTMemory"],
            "RunSPOTVcpu": sfn_params["RunSPOTVcpu"],
        }

        session = Session(region_name=settings.AWS_REGION)
        client = session.client(
            service_name="stepfunctions",
            endpoint_url=settings.BOTO_ENDPOINT_URL or None,
        )

        execution_name = re.sub(r"[^0-9a-zA-Z-]", r"-", execution_name)

        return client.start_execution(
            stateMachineArn=sfn_params["StateMachineArn"],
            name=execution_name,
            input=json.dumps(sfn_input_json),
        )


class PangolinJob(SwipeJob):
    def get_sfn_config(self):
        return self.settings.AWS_PANGOLIN_SFN_PARAMETERS

    def run(self, group: Group, sample_ids: List[str]):
        extra_params = {
            "samples": sample_ids,
        }
        now = datetime.datetime.now()
        output_suffix = f"/{str(now)}"
        execution_name = f"{group.prefix}-ondemand-pangolin-{str(now)}"
        return self._start(execution_name, output_suffix, extra_params)


class NextstrainJob(SwipeJob):
    job_type = "ondemand"

    def get_sfn_config(self):
        return self.settings.AWS_NEXTSTRAIN_SFN_PARAMETERS

    def run(self, run: PhyloRun, run_type: str):
        group = run.group
        now = datetime.datetime.now()
        output_suffix = f"/{group.name}/{str(now)}"
        execution_name = f"{group.prefix}-{self.job_type}-nextstrain-{str(now)}"
        extra_params = {
            "s3_filestem": f"{group.prefix}/{run.tree_type}",
            "pathogen_slug": run.pathogen.slug,
            "workflow_id": run.id,
        }
        return self._start(execution_name, output_suffix, extra_params)


class NextstrainScheduledJob(NextstrainJob):
    job_type = "scheduled"


class LineageQcJob(SwipeJob):
    job_type = "ondemand"
    run_type = "specified-ids-only"

    def get_sfn_config(self):
        return self.settings.AWS_LINEAGE_QC_SFN_PARAMETERS

    def run(
        self, group: Optional[Group], pathogen_slug: str, sample_ids: List[int] = []
    ):
        extra_params = {
            "pathogen_slug": pathogen_slug,
            # See workflow's `prep_samples.py` for allowed values of run_type
            "run_type": self.run_type,
            # sample_ids ignored if run_type is not "specified-ids-only" type
            "sample_ids": sample_ids,
        }
        now = datetime.datetime.now()
        output_suffix = f"/{str(now)}"
        group_prefix = ""
        if group is not None:
            group_prefix = f"{group.prefix}-"
        execution_name = (
            f"{group_prefix}{self.job_type}-{pathogen_slug}-lineage-qc-{str(now)}"
        )
        return self._start(execution_name, output_suffix, extra_params)


class LineageQcScheduledJob(LineageQcJob):
    job_type = "scheduled"
    run_type = "refresh-stale"
