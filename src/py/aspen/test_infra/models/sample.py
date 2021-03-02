from datetime import datetime

import pytest

from aspen.database.models import Sample


@pytest.fixture(scope="function")
def sample(session, group):
    sample = Sample(
        submitting_group=group,
        private_identifier="private_identifer",
        original_submission={},
        public_identifier="public_identifier",
        collection_date=datetime.now(),
        sample_collected_by="sample_collector",
        sample_collector_contact_address="sample_collector_address",
        location="Santa Clara County",
        division="California",
        country="USA",
        organism="SARS-CoV-2",
    )
    session.add(sample)
    session.commit()
    return sample
