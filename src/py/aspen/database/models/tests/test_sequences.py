from datetime import datetime

from ..physical_sample import PhysicalSample
from ..sequences import (
    SequencingInstrumentType,
    SequencingProtocolType,
    SequencingReads,
    UploadedPathogenGenome,
)
from ..usergroup import Group


def test_sequencing_reads(session):
    group = Group(name="groupname", email="groupemail", address="123 Main St")
    physical_sample = PhysicalSample(
        submitting_group=group,
        private_identifier="private_identifer",
        original_submission={},
        public_identifier="public_identifier",
        collection_date=datetime.now(),
        location="Santa Clara County",
        division="California",
        country="USA",
    )
    sequencing_reads = SequencingReads(
        physical_sample=physical_sample,
        sequencing_instrument=SequencingInstrumentType.ILLUMINA_GENOME_ANALYZER_IIX,
        sequencing_protocol=SequencingProtocolType.ARTIC_V3,
        sequencing_date=datetime.now(),
        s3_bucket="bucket",
        s3_key="key",
    )

    session.add_all(
        (
            group,
            physical_sample,
            sequencing_reads,
        )
    )
    session.flush()


def test_uploaded_pathogen_genome(session):
    group = Group(name="groupname", email="groupemail", address="123 Main St")
    physical_sample = PhysicalSample(
        submitting_group=group,
        private_identifier="private_identifer",
        original_submission={},
        public_identifier="public_identifier",
        collection_date=datetime.now(),
        location="Santa Clara County",
        division="California",
        country="USA",
    )
    uploaded_pathogen_genome = UploadedPathogenGenome(
        physical_sample=physical_sample,
        sequence="GAGAGACTCTCT",
        num_unambiguous_sites=8,
        num_n=2,
        num_mixed=2,
    )

    session.add_all(
        (
            group,
            physical_sample,
            uploaded_pathogen_genome,
        )
    )
    session.flush()
