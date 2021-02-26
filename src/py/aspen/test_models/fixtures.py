from datetime import datetime

import pytest

from aspen.database.models import (
    Accession,
    PublicRepositoryType,
    Sample,
    SequencingInstrumentType,
    SequencingProtocolType,
    SequencingReadsCollection,
)
from aspen.database.models.usergroup import Group, User


@pytest.fixture(scope="function")
def group(session) -> Group:
    group = Group(name="groupname", email="groupemail", address="123 Main St")
    session.add(group)
    session.commit()
    return group


@pytest.fixture(scope="function")
def user(session, group) -> User:
    user = User(
        name="test",
        auth0_user_id="test_auth0_id",
        email="test_user@dph.org",
        group_admin=True,
        system_admin=True,
        group=group,
    )
    session.add(user)
    session.commit()
    return user


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
