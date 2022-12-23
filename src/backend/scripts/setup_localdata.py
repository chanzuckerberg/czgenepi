import os
import random
from datetime import datetime

import boto3
import requests
from sqlalchemy.sql.expression import and_

from aspen.config.docker_compose import DockerComposeConfig
from aspen.database.connection import get_db_uri, init_db
from aspen.database.models import (
    AlignedRepositoryData,
    Group,
    LineageType,
    Location,
    MutationsCaller,
    Pathogen,
    PhyloRun,
    PhyloTree,
    ProcessedRepositoryData,
    PublicRepository,
    QCMetricCaller,
    RawRepositoryData,
    RepositoryAlignmentWorkflow,
    RepositoryDownloadWorkflow,
    Sample,
    SampleLineage,
    SampleMutation,
    SampleQCMetric,
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


def create_sample_lineage(session, sample):
    sample_lineage = (
        session.query(SampleLineage).filter(SampleLineage.sample == sample).first()
    )
    if sample_lineage:
        print("SampleLineage already exists")
        return sample_lineage
    print(f"Creating SampleLineage with sample private_id {sample.private_identifier}")

    pathogen_slug = sample.pathogen.slug
    lineage_type = (
        LineageType.PANGOLIN if pathogen_slug == "SC2" else LineageType.NEXTCLADE
    )

    # we're not using raw lineage output from NextClade for now, so only adding pangolin output for now

    random_scorpio_calls = ["B.1.167", "BA.1.15", "C.2", "A.1.1"]
    random_support_calls = ["0.775", "0.512", "0.477", "0.897"]
    raw_lineage_pangolin_output = {
        "scorpio_call": random.choice(random_scorpio_calls),
        "scorpio_support": random.choice(random_support_calls),
    }

    raw_lineage_output = raw_lineage_pangolin_output if pathogen_slug == "SC2" else {}
    sample_lineage = SampleLineage(
        sample=sample,
        lineage_type=lineage_type,
        lineage=random.choice(random_scorpio_calls),
        lineage_software_version="1.0.0",
        lineage_probability=random.choice(random_support_calls),
        raw_lineage_output=raw_lineage_output,
    )
    session.add(sample_lineage)
    return sample_lineage


def create_sample_mutations(session, sample):
    # 3/4 of samples should have mutations
    should_associate_data = random.choice(([True] * 3) + [False])
    if not should_associate_data:
        return None

    found_row = (
        session.query(SampleMutation).filter(SampleMutation.sample == sample).first()
    )
    if found_row:
        print("SampleMutation already exists")
        return found_row
    print(f"Creating SampleMutation with sample private_id {sample.private_identifier}")

    # TODO, we can probably 100% automatically generate fake data.
    random_substitutions = [
        "T128C,A204C,T466C,G475A,C630A,T720C,G749A,G994A,A1093G,C1201T,A1309G,A1504G,A1687G,A1813C,T1814G,T2086G,C2391A,T2554C,C2659T,T2688A",
        "T46760C,A46895G,G47140T,T47181C,G47735T,G47966A,C48041T,G48062T,G48138A,C48148A,C48392T,A48527C,C48951T,C49139T,T49223G,G49859T,C49957T,C49994T,A50294G,C50595A",
        "T74112C,G74303C,T74382C,A75351T,A75790G,C76021T,T76123C,A76198G,C76284T,A76648G,A76911G,A78461C,T78525C,A78641G,A78728C,A78942G",
        "C162639T,A162720G,T162828C,T162852A,C163256T,T163467C,A163886G,T164848C,G164849A,G165006A,A165096G,T165304C,C165691T,C166006T,C166196T",
    ]
    random_insertions = [
        "0:GTTAGTAAATTATATACATAATTTTATAATTAATTTA,629:AAGAGAG,755:ACA,1690:AA,2762:A,4597:T,6250:TT,6527:T,6966:TATCATTATGTATAATCATCACTGTCGC,6983:T",
        "629:AAGAGAG,755:ACA,1690:AA,2762:A,4597:T,6250:TT,6527:T,6966:TATCATTATGTATAATCATCACTGTCGC",
        "166090:AATAATT,168178:A,169526:T,169600:ATGA,169619:CAT,170009:A,170929:ATATCTGATATCTA,173154:T,173690:T,174461:T,177847:ATCTCAATCTCAATCTCA",
    ]
    random_deletions = [
        "593-602,617,2237-2239,4693-4775,6429-6430",
        "154351-154352,155417,156206,156370-158633,163190-163197",
        "190198-190199,190396,192435-192517",
    ]
    random_aa_substitutions = [
        "NBT03_gp174:S63A,NBT03_gp174:E80V,NBT03_gp174:D121E,NBT03_gp175:V4A,NBT03_gp175:L136F,NBT03_gp175:A273T,OPG002:I22L,OPG002:A121S",
        "OPG085:F591V,OPG089:K213I,OPG089:D303E,OPG091:F18S,OPG091:V62I,OPG091:S73N,OPG092:I244N",
        "OPG164:E117K,OPG164:Q137L,OPG164:Y217H,OPG165:D63G,OPG165:D106N",
    ]
    random_aa_insertions = [
        "OPG047:476:WNGMG,OPG110:73:EEV",
        "OPG110:73:EEV,OPG153:366:DD,OPG153:371:DDDDDDDDD",
        "OPG153:371:DDDDDDDDD,OPG164:212:*Q*Q*",
    ]
    random_aa_deletions = [
        "OPG002:V171-,OPG029:D150-,OPG029:D151-,OPG031:G258-",
        "OPG049:R314-,OPG050:F71-,OPG157:Q60-,OPG159:N114-,OPG159:N115-",
        "OPG197:E37-,OPG197:D38-,OPG197:I39-",
    ]

    new_row = SampleMutation(
        sample=sample,
        substitutions=random.choice(random_substitutions),
        insertions=random.choice(random_insertions),
        deletions=random.choice(random_deletions),
        aa_substitutions=random.choice(random_aa_substitutions),
        aa_insertions=random.choice(random_aa_insertions),
        aa_deletions=random.choice(random_aa_deletions),
        reference_sequence_accession="NC_063383.1",
        mutations_caller=MutationsCaller.NEXTCLADE,
    )

    session.add(new_row)
    return new_row


def create_sample_qc_metrics(session, sample):
    should_associate_data = random.choice(([True] * 3) + [False])
    if not should_associate_data:
        return None

    sample_qc_metric = (
        session.query(SampleQCMetric).filter(SampleQCMetric.sample == sample).first()
    )
    if sample_qc_metric:
        print("SampleQCMetric already exists")
        return sample_qc_metric
    print(
        f"Creating SampleSampleQCMetricLineage with sample private_id {sample.private_identifier}"
    )

    random_qc_status_scores = {
        "good": ["18.062500", "8.062500", "11.062500"],
        "mediocre": ["52.062500", "86.062500", "67.062500"],
        "bad": ["493.558728", "200.694444", "771.691989"],
        "failed": [
            None,
        ],
        "invalid": [
            None,
        ],
    }

    random_qc_status = random.choice(list(random_qc_status_scores.keys()))
    random_qc_score = random.choice(random_qc_status_scores[random_qc_status])

    sample_qc_metrics = SampleQCMetric(
        sample=sample,
        qc_caller=QCMetricCaller.NEXTCLADE,
        qc_software_version="1.0.0",
        qc_score=random_qc_score,
        qc_status=random_qc_status,
        raw_qc_output={},
    )

    session.add(sample_qc_metrics)
    return sample_qc_metrics


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
        # check if sample has associated sample_lineage or sample_qc_metrics
        # Note - this isn't idempotent anymore since we're randomly choosing to assign
        #        associated rows or not.
        create_sample_lineage(session, sample)
        create_sample_qc_metrics(session, sample)
        create_sample_mutations(session, sample)
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
    create_sample_lineage(session, sample)
    create_sample_qc_metrics(session, sample)
    create_sample_mutations(session, sample)
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
    aligned_workflow = session.query(AlignedRepositoryData).where(AlignedRepositoryData.pathogen == pathogen).first()
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
