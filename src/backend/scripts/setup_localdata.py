from datetime import datetime
import boto3
import os

from aspen.config.docker_compose import DockerComposeConfig
from aspen.database.connection import get_db_uri, init_db
from aspen.database.models import (
    AlignedGisaidDump,
    GisaidAlignmentWorkflow,
    GisaidDumpWorkflow,
    Group,
    ProcessedGisaidDump,
    RawGisaidDump,
    RegionType,
    Sample,
    SequencingInstrumentType,
    SequencingProtocolType,
    SequencingReadsCollection,
    User,
    WorkflowStatusType,
)


def create_test_group(session):
    g = session.query(Group).filter(Group.name == "CZI").one_or_none()
    if g:
        print("Group already exists")
        return g
    print("Creating group")
    g = Group(
        name="CZI", address="601 Marshall St, Redwood City, CA 94063", prefix="CZI"
    )
    session.add(g)
    session.commit()
    g = session.query(Group).filter(Group.name == "CZI").one_or_none()
    return g


def create_test_user(session, group):
    u = session.query(User).filter(User.auth0_user_id == "User1").one_or_none()
    if u:
        print("User already exists")
        return u
    print("Creating user")
    u = User(
        name="Test User",
        auth0_user_id="User1",
        email="aspen-testuser@chanzuckerberg.com",
        group_admin=True,
        system_admin=True,
        group=group,
    )
    session.add(u)
    return u


def create_sample(session, group, uploaded_by_user):
    sample = (
        session.query(Sample)
        .filter(Sample.submitting_group == group)
        .order_by(Sample.id)
        .first()
    )
    if sample:
        print("Sample already exists")
        return sample
    print("Creating sample")
    sample = Sample(
        submitting_group=group,
        private_identifier="private_identifer",
        uploaded_by=uploaded_by_user,
        original_submission={},
        public_identifier="public_identifier",
        collection_date=datetime.now(),
        sample_collected_by="sample_collector",
        sample_collector_contact_address="sample_collector_address",
        location="Santa Clara County",
        division="California",
        country="USA",
        region=RegionType.NORTH_AMERICA,
        organism="SARS-CoV-2",
    )
    session.add(sample)
    return sample


def create_sequencing_reads(session, sample):
    sequencing_reads = (
        session.query(SequencingReadsCollection)
        .filter(SequencingReadsCollection.sample == sample)
        .first()
    )
    if sequencing_reads:
        print("Sequencing Reads already exists")
        return sequencing_reads
    print("Creating Sequencing Reads")
    sequencing_reads = SequencingReadsCollection(
        sample=sample,
        sequencing_instrument=SequencingInstrumentType.ILLUMINA_GENOME_ANALYZER_IIX,
        sequencing_protocol=SequencingProtocolType.ARTIC_V3,
        sequencing_date=datetime.now(),
        s3_bucket="bucket",
        s3_key="key",
    )
    session.add(sequencing_reads)
    return sequencing_reads


def create_gisaid(session):
    aligned_workflow = session.query(AlignedGisaidDump).first()
    if aligned_workflow:
        print("Aligned Gisaid Dump already exists")
        return
    # Add raw gisaid dump
    gisaid_s3_bucket = "genepi-gisaid-data"
    s3_resource = boto3.resource(
        "s3",
        endpoint_url=os.getenv("BOTO_ENDPOINT_URL") or None,
        config=boto3.session.Config(signature_version="s3v4"),
    )
    suffix = datetime.now().isoformat()
    raw_s3_key=f"raw_gisaid_dump-{suffix}"
    processed_sequences_s3_key=f"processed_sequences-{suffix}"
    processed_metadata_s3_key=f"processed_metadata-{suffix}"
    aligned_sequences_s3_key=f"aligned_sequences-{suffix}"
    aligned_metadata_s3_key=f"aligned_metadata-{suffix}"
    raw_gisaid_dump = RawGisaidDump(
        download_date=datetime.now(),
        s3_bucket=gisaid_s3_bucket,
        s3_key=raw_s3_key,
    )
    session.add(raw_gisaid_dump)
    s3_resource.Bucket(gisaid_s3_bucket).Object(raw_s3_key).put(Body="")
    s3_resource.Bucket(gisaid_s3_bucket).Object(processed_sequences_s3_key).put(Body="")
    s3_resource.Bucket(gisaid_s3_bucket).Object(processed_metadata_s3_key).put(Body="")
    s3_resource.Bucket(gisaid_s3_bucket).Object(aligned_sequences_s3_key).put(Body="")
    s3_resource.Bucket(gisaid_s3_bucket).Object(aligned_metadata_s3_key).put(Body="")

    # add transformed gisaid dump
    processed_gisaid_dump = ProcessedGisaidDump(
        s3_bucket=gisaid_s3_bucket,
        sequences_s3_key=processed_sequences_s3_key,
        metadata_s3_key=processed_metadata_s3_key,
    )
    processed_workflow = GisaidDumpWorkflow(
        start_datetime=datetime.now(),
        end_datetime=datetime.now(),
        workflow_status=WorkflowStatusType.COMPLETED,
        software_versions={},
    )

    processed_workflow.inputs.append(raw_gisaid_dump)
    processed_workflow.outputs.append(processed_gisaid_dump)
    session.add(processed_workflow)

    # Add an aligned dump
    aligned_gisaid_dump = AlignedGisaidDump(
        s3_bucket=gisaid_s3_bucket,
        sequences_s3_key=aligned_sequences_s3_key,
        metadata_s3_key=aligned_metadata_s3_key,
    )

    # attach a workflow
    aligned_workflow = GisaidAlignmentWorkflow(
        start_datetime=datetime.now(),
        end_datetime=datetime.now(),
        workflow_status=WorkflowStatusType.COMPLETED,
        software_versions={},
    )

    aligned_workflow.inputs.append(processed_gisaid_dump)
    aligned_workflow.outputs.append(aligned_gisaid_dump)
    session.add(aligned_workflow)


def create_test_data(engine):
    session = engine.make_session()
    group = create_test_group(session)
    user = create_test_user(session, group)
    sample = create_sample(session, group, user)
    _ = create_sequencing_reads(session, sample)
    _ = create_gisaid(session)
    session.commit()


def get_engine():
    config = DockerComposeConfig()
    engine = init_db(get_db_uri(config))
    return engine


if __name__ == "__main__":
    engine = get_engine()
    create_test_data(engine)
