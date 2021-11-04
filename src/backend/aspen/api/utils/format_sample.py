import datetime
from typing import Any, Mapping, Optional

from aspen.api.utils import format_date
from aspen.database.models import (
    GisaidAccession,
    GisaidAccessionWorkflow,
    Sample,
    WorkflowStatusType,
)


def determine_gisaid_status(
    sample: Sample,
    gisaid_accession_workflow: GisaidAccessionWorkflow,
    gisaid_accession: GisaidAccession,
    rejection_time: datetime.timedelta,
) -> Mapping[str, Optional[str]]:
    if sample.czb_failed_genome_recovery:
        return {"status": "Not Eligible", "gisaid_id": None}

    if not gisaid_accession_workflow:
        return {"status": "Not Yet Submitted", "gisaid_id": None}

    if (
        gisaid_accession_workflow.workflow_status == WorkflowStatusType.COMPLETED
        and gisaid_accession
    ):
        if not gisaid_accession.public_identifier:
            return {
                "status": "Submitted",
                "gisaid_id": "Not Provided",
            }
        return {
            "status": "Accepted",
            "gisaid_id": gisaid_accession.public_identifier,
        }

    date_since_submitted = (
        datetime.date.today() - gisaid_accession_workflow.start_datetime.date()
    )
    if date_since_submitted < GISAID_REJECTION_TIME:
        return {"status": "Submitted", "gisaid_id": None}
    else:
        return {"status": "Rejected", "gisaid_id": None}
    return {"status": "Not Yet Submitted", "gisaid_id": None}


def format_sample_lineage(sample: Sample) -> dict[str, Any]:
    pathogen_genome = sample.uploaded_pathogen_genome
    if pathogen_genome:
        lineage = {
            "lineage": pathogen_genome.pangolin_lineage,
            "probability": pathogen_genome.pangolin_probability,
            "version": pathogen_genome.pangolin_version,
            "last_updated": format_date(pathogen_genome.pangolin_last_updated),
        }
    else:
        lineage = {
            "lineage": None,
            "probability": None,
            "version": None,
            "last_updated": None,
        }

    return lineage
