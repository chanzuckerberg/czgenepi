import datetime
from typing import Dict, List

from aspen.database.models import Accession, AccessionType, Location, Sample
from aspen.test_infra.models.gisaid_accession import gisaid_accession_factory


def sample_factory(
    submitting_group,
    uploaded_by,
    collection_location: Location,
    private_identifier="private_identifer",
    original_submission=None,
    public_identifier="public_identifier",
    collection_date=None,
    sample_collected_by="sample_collector",
    sample_collector_contact_address="sample_collector_address",
    czb_failed_genome_recovery=False,
    pathogen=None,
    organism="SARS-CoV-2",
    private=False,
    accessions: Dict[AccessionType, str] = {
        AccessionType.GISAID_ISL: "EPI_ISL_8675309",
    },
) -> Sample:
    original_submission = original_submission or {}
    collection_date = collection_date or datetime.date.today()
    sample = Sample(
        submitting_group=submitting_group,
        uploaded_by=uploaded_by,
        private_identifier=private_identifier,
        original_submission=original_submission,
        public_identifier=public_identifier,
        collection_date=collection_date,
        sample_collected_by=sample_collected_by,
        sample_collector_contact_address=sample_collector_contact_address,
        collection_location=collection_location,
        czb_failed_genome_recovery=czb_failed_genome_recovery,
        organism=organism,
        pathogen=pathogen,
        private=private,
    )
    created_accessions: List[Accession] = []
    for accession_type, identifier in accessions.items():
        if accession_type == AccessionType.GISAID_ISL:
            created_accessions.append(gisaid_accession_factory(sample, identifier))
        else:
            raise NotImplementedError
    sample.accessions = created_accessions
    return sample
