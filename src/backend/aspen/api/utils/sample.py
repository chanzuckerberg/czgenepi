from typing import Any, Mapping, Optional

from aspen.database.models import Accession, AccessionType, Sample


def determine_gisaid_status(
    sample: Sample,
) -> Mapping[str, Optional[str]]:
    if sample.czb_failed_genome_recovery:
        return {"status": "Not Eligible", "gisaid_id": None}

    gisaid_accession: Optional[Accession] = None
    for accession in sample.accessions:
        if accession.accession_type == AccessionType.GISAID_ISL:
            gisaid_accession = accession
            break

    if gisaid_accession:
        return {
            "status": "Accepted",
            "gisaid_id": gisaid_accession.accession,
        }

    return {"status": "Not Found", "gisaid_id": None}


def format_sample_lineage(sample: Sample) -> dict[str, Any]:
    pathogen_genome = sample.uploaded_pathogen_genome
    if pathogen_genome:
        lineage = {
            "lineage": pathogen_genome.pangolin_lineage,
            "probability": pathogen_genome.pangolin_probability,
            "version": pathogen_genome.pangolin_version,
            "last_updated": pathogen_genome.pangolin_last_updated,
        }
    else:
        lineage = {
            "lineage": None,
            "probability": None,
            "version": None,
            "last_updated": None,
        }

    return lineage
