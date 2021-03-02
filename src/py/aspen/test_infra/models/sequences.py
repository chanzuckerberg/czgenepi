from datetime import datetime

import pytest

from aspen.database.models import (
    Accession,
    PublicRepositoryType,
    SequencingInstrumentType,
    SequencingProtocolType,
    SequencingReadsCollection,
)


@pytest.fixture(scope="function")
def sequencing_read(session, sample):
    sequencing_reads = SequencingReadsCollection(
        sample=sample,
        sequencing_instrument=SequencingInstrumentType.ILLUMINA_GENOME_ANALYZER_IIX,
        sequencing_protocol=SequencingProtocolType.ARTIC_V3,
        sequencing_date=datetime.now(),
        s3_bucket="bucket",
        s3_key="key",
    )
    sequencing_reads.accessions.append(
        Accession(
            repository_type=PublicRepositoryType.GISAID,
            public_identifier="gisaid_public_identifier",
        )
    )
    session.add(sequencing_reads)
    session.commit()
    return sequencing_reads
