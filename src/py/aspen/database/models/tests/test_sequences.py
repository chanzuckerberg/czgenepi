from datetime import datetime

from ..sample import Sample
from ..sequences import (
    SequencingInstrumentType,
    SequencingProtocolType,
    SequencingReadCollection,
    UploadedPathogenGenome,
)
from ..usergroup import Group


def test_sequencing_reads(session):
    group = Group(name="groupname", email="groupemail", address="123 Main St")
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
    sequencing_reads = SequencingReadCollection(
        sample=sample,
        sequencing_instrument=SequencingInstrumentType.ILLUMINA_GENOME_ANALYZER_IIX,
        sequencing_protocol=SequencingProtocolType.ARTIC_V3,
        sequencing_date=datetime.now(),
        s3_bucket="bucket",
        s3_key="key",
    )

    session.add_all(
        (
            group,
            sample,
            sequencing_reads,
        )
    )
    session.flush()


def test_uploaded_pathogen_genome(session):
    group = Group(name="groupname", email="groupemail", address="123 Main St")
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
    uploaded_pathogen_genome = UploadedPathogenGenome(
        sample=sample,
        sequence="GAGAGACTCTCT",
        num_unambiguous_sites=8,
        num_missing_alleles=2,
        num_mixed=2,
    )

    session.add_all(
        (
            group,
            sample,
            uploaded_pathogen_genome,
        )
    )
    session.flush()
