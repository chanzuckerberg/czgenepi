import os
from datetime import datetime

import boto3
import requests
from sqlalchemy.sql.expression import and_

from aspen.config.docker_compose import DockerComposeConfig
from aspen.database.connection import get_db_uri, init_db
from aspen.database.models import (
    AlignedRepositoryData,
    Group,
    Location,
    Pathogen,
    PhyloRun,
    PhyloTree,
    ProcessedRepositoryData,
    PublicRepository,
    RawRepositoryData,
    RepositoryAlignmentWorkflow,
    RepositoryDownloadWorkflow,
    Sample,
    TreeType,
    UploadedPathogenGenome,
    User,
    Workflow,
    WorkflowStatusType,
)
from aspen.database.models.workflow import SoftwareNames


def create_test_group(session, group_name, prefix, default_tree_location):
    g = session.query(Group).filter(Group.name == group_name).one_or_none()
    if g:
        print("Group already exists")
        return g
    print("Creating group")
    g = Group(
        name=group_name,
        address="123 Example St, Redwood City CA",
        prefix=prefix,
        default_tree_location=default_tree_location,
    )
    session.add(g)
    session.commit()
    g = session.query(Group).filter(Group.name == group_name).one_or_none()
    return g


def create_test_user(session, email, group, user_id, name):
    u = session.query(User).filter(User.email == email).one_or_none()
    if u:
        print("User already exists")
        return u
    print("Creating user")
    u = User(
        name=name,
        auth0_user_id=user_id,
        split_id=user_id,
        analytics_id=user_id,
        email=email,
        system_admin=True,
        agreed_to_tos=True,  # TODO - FE tests need to be updated for agree modal!
    )
    session.add(u)
    return u


def create_location(session, region, country, division, location):
    location = (
        session.query(Location)
        .filter(
            and_(
                Location.region == region,
                Location.country == country,
                Location.division == division,
                Location.location == location,
            )
        )
        .one_or_none()
    )
    if location:
        print("Location already exists")
        return location
    print("Creating location")
    location = Location(
        region=region,
        country=country,
        division=division,
        location=location,
    )
    session.add(location)
    session.commit()
    return location


def create_repositories(session):
    get_or_create = [{"name": "GISAID"}, {"name": "GenBank"}]
    repositories = []
    for record in get_or_create:
        repo = (
            session.query(PublicRepository)
            .where(PublicRepository.name == record["name"])
            .one_or_none()
        )
        if not repo:
            repo = PublicRepository(name=record["name"])
            session.add(repo)
        repositories.append(repo)
    return repositories


def create_pathogens(session):
    get_or_create = [
        {"name": "SARS-CoV-2", "slug": "SC2"},
        {"name": "Monkeypox", "slug": "MPX"},
    ]
    pathogens = []
    for record in get_or_create:
        pathogen = (
            session.query(Pathogen).where(Pathogen.slug == record["slug"]).one_or_none()
        )
        if not pathogen:
            pathogen = Pathogen(name=record["name"], slug=record["slug"])
            session.add(pathogen)
        pathogens.append(pathogen)
    return pathogens


def create_sample(
    session, group, pathogen, uploaded_by_user, location, suffix, is_failed=False
):
    private_id = f"{group.prefix}-private_identifier_{suffix}_{pathogen.slug}"
    public_id = f"{group.prefix}-public_identifier_{suffix}_{pathogen.slug}"
    if is_failed:
        private_id += "_failed"
        public_id += "_failed"
    sample = (
        session.query(Sample)
        .filter(Sample.private_identifier == private_id)
        .filter(Sample.submitting_group == group)
        .filter(Sample.czb_failed_genome_recovery == is_failed)
        .filter(Sample.pathogen == pathogen)
        .order_by(Sample.id)
        .first()
    )
    if sample:
        print("Sample already exists")
        return sample
    print(f"Creating sample {private_id}")
    sample = Sample(
        submitting_group=group,
        private_identifier=private_id,
        uploaded_by=uploaded_by_user,
        original_submission={},
        pathogen=pathogen,
        public_identifier=public_id,
        collection_date=datetime.now(),
        czb_failed_genome_recovery=is_failed,
        sample_collected_by="sample_collector",
        sample_collector_contact_address="sample_collector_address",
        collection_location=location,
        organism="SARS-CoV-2",
    )
    upg: UploadedPathogenGenome = UploadedPathogenGenome(
        sample=sample,
        sequence="ATTAAAGCCCCCAAGTC",
        sequencing_date=datetime.now(),
        upload_date=datetime.now(),
    )
    session.add(upg)
    session.add(sample)
    return sample


def create_run(session, group, pathogen, user, tree_type, status, name=None):
    run = (
        session.query(PhyloRun)
        .filter(PhyloRun.tree_type == tree_type)
        .filter(PhyloRun.user == user)
        .filter(PhyloRun.group == group)
        .filter(PhyloRun.workflow_status == status)
        .filter(PhyloRun.pathogen == pathogen)
        .order_by(PhyloRun.id)
        .first()
    )
    if run:
        return run
    aligned_dump = (
        session.query(AlignedRepositoryData)
        .join(AlignedRepositoryData.producing_workflow)
        .order_by(Workflow.end_datetime.desc())
        .first()
    )

    if name:
        print(f"Creating phylo_run {name}")
    workflow: PhyloRun = PhyloRun(
        start_datetime=datetime.now(),
        workflow_status=status,
        software_versions={},
        name=name,
        group=group,
        pathogen=pathogen,
        tree_type=tree_type,
        user=user,
    )
    workflow.inputs = [aligned_dump]
    workflow.template_args = {}

    session.add(workflow)
    return workflow


def create_tree(session, phylo_run):
    tree_type = phylo_run.tree_type
    group = phylo_run.group
    s3_key = f"phylo_trees/{group.name}/{tree_type.value}/{phylo_run.id}/ncov_auspice.json".lower()
    tree = session.query(PhyloTree).filter(PhyloTree.s3_key == s3_key).first()
    if tree:
        print(f"tree {s3_key} already exists")
        return tree
    print(f"creating tree {s3_key}")
    phylo_tree = PhyloTree(
        s3_bucket="genepi-db-data",
        s3_key=s3_key,
        constituent_samples=[],
        name=phylo_run.name,
        tree_type=phylo_run.tree_type,
        pathogen=phylo_run.pathogen,
    )
    # update the run object with the metadata about the run.
    phylo_run.end_datetime = datetime.now()
    phylo_run.software_versions = {
        SoftwareNames.ASPEN_WORKFLOW: "1.10",
        SoftwareNames.ASPEN_CREATION: "2.10",
        SoftwareNames.NCOV: "3.10",
        SoftwareNames.ASPEN_DOCKER_IMAGE: "4.10",
    }
    phylo_run.outputs = [phylo_tree]
    session.add(phylo_tree)
    return phylo_tree


def create_test_trees(session, group, pathogen, user):
    tree_types = ["OVERVIEW", "NON_CONTEXTUALIZED", "TARGETED"]
    incomplete_statuses = [WorkflowStatusType.STARTED, WorkflowStatusType.FAILED]
    # Create 3 in-progress workflows
    for typename in tree_types:
        for status in incomplete_statuses:
            tree_type = TreeType(typename)
            name = None
            run_user = None
            if typename == "TARGETED":
                name = f"{group.name} {status.value.title()} {typename.title()} {pathogen.slug} Run"
                run_user = user
            create_run(session, group, pathogen, run_user, tree_type, status, name)
    # Create 3 workflows with successful trees
    for typename in tree_types:
        status = WorkflowStatusType.COMPLETED
        tree_type = TreeType(typename)
        name = None
        run_user = None
        if typename == "TARGETED":
            name = f"{group.name} {status.value.title()} {typename.title()} {pathogen.slug} Run"
            run_user = user
        run = create_run(session, group, pathogen, run_user, tree_type, status, name)
        create_tree(session, run)


def create_alignment_entity(session, pathogen, repository):
    aligned_workflow = session.query(AlignedRepositoryData).first()
    if aligned_workflow:
        print("Aligned Repository Dump already exists")
        return
    # Add raw repo dump
    repo_s3_bucket = "genepi-gisaid-data"
    s3_resource = boto3.resource(
        "s3",
        endpoint_url=os.getenv("BOTO_ENDPOINT_URL") or None,
        config=boto3.session.Config(signature_version="s3v4"),
    )
    suffix = datetime.now().isoformat()
    raw_s3_key = f"raw_repo_dump-{suffix}"
    processed_sequences_s3_key = f"processed_sequences-{suffix}"
    processed_metadata_s3_key = f"processed_metadata-{suffix}"
    aligned_sequences_s3_key = f"aligned_sequences-{suffix}"
    aligned_metadata_s3_key = f"aligned_metadata-{suffix}"
    raw_repo_dump = RawRepositoryData(
        pathogen=pathogen,
        public_repository=repository,
        download_date=datetime.now(),
        s3_bucket=repo_s3_bucket,
        s3_key=raw_s3_key,
    )
    session.add(raw_repo_dump)
    s3_resource.Bucket(repo_s3_bucket).Object(raw_s3_key).put(Body="")
    s3_resource.Bucket(repo_s3_bucket).Object(processed_sequences_s3_key).put(Body="")
    s3_resource.Bucket(repo_s3_bucket).Object(processed_metadata_s3_key).put(Body="")
    s3_resource.Bucket(repo_s3_bucket).Object(aligned_sequences_s3_key).put(Body="")
    s3_resource.Bucket(repo_s3_bucket).Object(aligned_metadata_s3_key).put(Body="")

    # add transformed repo dump
    processed_repo_dump = ProcessedRepositoryData(
        pathogen=pathogen,
        public_repository=repository,
        s3_bucket=repo_s3_bucket,
        sequences_s3_key=processed_sequences_s3_key,
        metadata_s3_key=processed_metadata_s3_key,
    )
    processed_workflow = RepositoryDownloadWorkflow(
        pathogen=pathogen,
        public_repository=repository,
        start_datetime=datetime.now(),
        end_datetime=datetime.now(),
        workflow_status=WorkflowStatusType.COMPLETED,
        software_versions={},
    )

    processed_workflow.inputs.append(raw_repo_dump)
    processed_workflow.outputs.append(processed_repo_dump)
    session.add(processed_workflow)

    # Add an aligned dump
    aligned_repo_dump = AlignedRepositoryData(
        pathogen=pathogen,
        public_repository=repository,
        s3_bucket=repo_s3_bucket,
        sequences_s3_key=aligned_sequences_s3_key,
        metadata_s3_key=aligned_metadata_s3_key,
    )

    # attach a workflow
    aligned_workflow = RepositoryAlignmentWorkflow(
        pathogen=pathogen,
        public_repository=repository,
        start_datetime=datetime.now(),
        end_datetime=datetime.now(),
        workflow_status=WorkflowStatusType.COMPLETED,
        software_versions={},
    )

    aligned_workflow.inputs.append(processed_repo_dump)
    aligned_workflow.outputs.append(aligned_repo_dump)
    session.add(aligned_workflow)


def create_samples(
    session, group, user, pathogen, location, num_successful, num_failures
):
    for suffix in range(num_successful):
        _ = create_sample(session, group, user, pathogen, location, suffix)
    for suffix in range(num_failures):
        _ = create_sample(session, group, user, pathogen, location, suffix, True)


def get_default_file(s3_resource):
    default_bucket = "genepi-db-data"
    default_key = "localdev_default_tree.json"
    def_file = s3_resource.Object(default_bucket, default_key)
    try:
        _ = def_file.content_length
        print("default tree file located")
        return def_file
    except:  # noqa
        pass
    print("downloading default tree json")
    document_body = requests.get(
        "https://data.nextstrain.org/files/ncov/open/oceania/oceania.json"
    ).content
    default_file = s3_resource.Object(default_bucket, default_key)
    default_file.put(Body=document_body)
    return default_file


def upload_tree_files(session):
    default_file = None
    s3_resource = boto3.resource(
        "s3",
        endpoint_url=os.getenv("BOTO_ENDPOINT_URL") or None,
        config=boto3.session.Config(signature_version="s3v4"),
    )
    trees = session.query(PhyloTree)
    for tree in trees:
        s3file = s3_resource.Object(tree.s3_bucket, tree.s3_key)
        try:
            _ = s3file.content_length
            continue
        except:  # noqa
            pass
        if not default_file:
            default_file = get_default_file(s3_resource)
        print(f"uploading {tree.s3_bucket}/{tree.s3_key}")
        s3file.copy_from(
            CopySource={"Bucket": default_file.bucket_name, "Key": default_file.key}
        )


def create_test_data(engine):
    session = engine.make_session()
    pathogens = create_pathogens(session)
    repositories = create_repositories(session)
    for pathogen in pathogens:
        _ = create_alignment_entity(session, pathogen, repositories[0])

    # Create db rows for our main test user
    location = create_location(
        session, "North America", "USA", "California", "San Mateo County"
    )
    group = create_test_group(session, "CZI", "CZI", location)
    user = create_test_user(session, "user1@czgenepi.org", group, "User1", "Test User")
    for pathogen in pathogens:
        create_samples(session, group, pathogen, user, location, 10, 5)
        create_test_trees(session, group, pathogen, user)

    # Create db rows for another group
    location2 = create_location(session, "Africa", "Mali", "Timbuktu", None)
    group2 = create_test_group(
        session, "Timbuktu Dept of Public Health", "TBK", location2
    )
    user2 = create_test_user(
        session, "tbktu@czgenepi.org", group2, "tbktu", "Timbuktu User"
    )
    for pathogen in pathogens:
        create_samples(session, group2, pathogen, user2, location2, 10, 10)
        create_test_trees(session, group2, pathogen, user2)

    upload_tree_files(session)

    session.commit()


def get_engine():
    config = DockerComposeConfig()
    engine = init_db(get_db_uri(config))
    return engine


if __name__ == "__main__":
    engine = get_engine()
    create_test_data(engine)
