import datetime

from aspen.database.models import Location, Sample


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
    organism="SARS-CoV-2",
    czb_failed_genome_recovery=False,
    private=False,
) -> Sample:
    original_submission = original_submission or {}
    collection_date = collection_date or datetime.date.today()
    return Sample(
        submitting_group=submitting_group,
        uploaded_by=uploaded_by,
        private_identifier=private_identifier,
        original_submission=original_submission,
        public_identifier=public_identifier,
        collection_date=collection_date,
        sample_collected_by=sample_collected_by,
        sample_collector_contact_address=sample_collector_contact_address,
        collection_location=collection_location,
        organism=organism,
        czb_failed_genome_recovery=czb_failed_genome_recovery,
        private=private,
    )
