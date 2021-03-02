import datetime
import json
import logging
import re
import warnings
from typing import (
    Any,
    Collection,
    Iterator,
    List,
    Mapping,
    MutableMapping,
    MutableSequence,
    Sequence,
)

import boto3
import pytz
import tqdm
from sqlalchemy import and_, or_
from sqlalchemy.orm import joinedload, Session

from aspen.aws.s3 import S3UrlParser
from aspen.database.connection import session_scope, SqlAlchemyInterface
from aspen.database.models import (
    Accession,
    Entity,
    Group,
    PhyloRun,
    PhyloTree,
    PublicRepositoryType,
    Sample,
    UploadedPathogenGenome,
    WorkflowStatusType,
)
from covid_database import init_db as Cinit_db
from covid_database import SqlAlchemyInterface as CSqlAlchemyInterface
from covid_database import util as Cutil
from covid_database.models.enums import ConsensusGenomeStatus
from covid_database.models.ngs_sample_tracking import (
    ConsensusGenome,
    CZBID,
    DphCZBID,
    Project,
    SampleFastqs,
)

logger = logging.getLogger(__name__)


def covidhub_interface_from_secret(secret_id: str) -> CSqlAlchemyInterface:
    interface = Cinit_db(Cutil.get_db_uri(secret_id))
    return interface


def list_bucket(s3_resource, bucket: str, key_prefix: str) -> Iterator[str]:
    nexttoken = None
    while True:
        kwargs: Mapping[str, Any] = {}
        if nexttoken is not None:
            kwargs["ContinuationToken"] = nexttoken
        results = s3_resource.meta.client.list_objects_v2(
            Bucket=bucket, Prefix=key_prefix, **kwargs
        )
        for result in results["Contents"]:
            yield result["Key"]
        if not results["IsTruncated"]:
            return
        nexttoken = results["NextContinuationToken"]


def get_names_from_tree(tree) -> Sequence[str]:
    results: MutableSequence[str] = list()
    for node in tree:
        results.append(node["name"])
        if "children" in node:
            results.extend(get_names_from_tree(node["children"]))

    return results


def import_project(
    interface: SqlAlchemyInterface,
    covidhub_secret_id: str,
    rr_project_id: str,
    s3_src_prefix: str,
    s3_src_profile: str,
    s3_dst_prefix: str,
    s3_dst_profile: str,
):
    covidhub_interface = covidhub_interface_from_secret(covidhub_secret_id)
    covidhub_session: Session = covidhub_interface.make_session()

    with session_scope(interface) as session:
        project = (
            covidhub_session.query(Project)
            .filter(Project.rr_project_id == rr_project_id)
            .one()
        )

        group = (
            session.query(Group)
            .filter(Group.name == project.originating_lab)
            .one_or_none()
        )
        if group is None:
            # copy the project info into the "group"
            group = Group(
                name=project.originating_lab,
                address=project.originating_address,
                # FIXME: this needs to be updated.
                email="FAKE_EMAIL@gmail.com",
            )
            session.add(group)

        logger.info("Retrieving from COVIDHUB DB...")
        consensus_genomes: Collection[ConsensusGenome] = (
            covidhub_session.query(ConsensusGenome)
            .join(SampleFastqs, CZBID, Project)
            .distinct(CZBID.id)
            .filter(Project.rr_project_id == rr_project_id)
            .filter(
                or_(
                    ConsensusGenome.status == ConsensusGenomeStatus.PASSED_AUTO,
                    ConsensusGenome.status == ConsensusGenomeStatus.PASSED_MANUAL,
                )
            )
            .order_by(
                CZBID.id.desc(),
                ConsensusGenome.recovered_sites.desc(),
                ConsensusGenome.id.desc(),
            )
            .options(
                joinedload(ConsensusGenome.sample_fastqs)
                .joinedload(SampleFastqs.czb_id)
                .joinedload(CZBID.genome_submission_info),
            )
            .all()
        )

        external_accessions = {
            consensus_genome.sample_fastqs.czb_id.external_accession
            for consensus_genome in tqdm.tqdm(consensus_genomes)
            if isinstance(consensus_genome.sample_fastqs.czb_id, DphCZBID)
        }
        external_accessions_to_samples: Mapping[str, Sample] = {
            sample.private_identifier: sample
            for sample in session.query(Sample).filter(
                and_(
                    Sample.submitting_group == group,
                    Sample.private_identifier.in_(external_accessions),
                )
            )
        }
        public_identifier_to_sample: MutableMapping[str, Sample] = dict()

        logger.info("Creating new objects...")
        for consensus_genome in tqdm.tqdm(consensus_genomes):
            czbid = consensus_genome.sample_fastqs.czb_id
            if not isinstance(czbid, DphCZBID):
                warnings.warn(
                    "consensus genome has non-dphczbid"
                    f"{consensus_genome.sample_fastqs.czb_id}"
                )
                continue
            if czbid.external_accession in (
                "OCPHL2207",
                "OCPHL2208",
            ):
                external_accession = f"{czbid.external_accession} ({czbid.czb_id}"
            else:
                external_accession = czbid.external_accession
            sample = external_accessions_to_samples.get(external_accession, None)
            if sample is None:
                sample = Sample(
                    submitting_group=group, private_identifier=external_accession
                )

            sample.original_submission = {}
            sample.public_identifier = (
                f"USA/{czbid.submission_base}/{czbid.collection_date.year}"
            )
            sample.sample_collected_by = project.originating_lab
            sample.sample_collector_contact_address = project.originating_address
            sample.collection_date = czbid.collection_date
            sample.location = project.location
            sample.division = "California"
            sample.country = "USA"
            sample.organism = "SARS-CoV-2"

            if sample.uploaded_pathogen_genome is None:
                sample.uploaded_pathogen_genome = UploadedPathogenGenome(
                    sample=sample,
                )
            sample.uploaded_pathogen_genome.upload_date = czbid.date_received
            sample.uploaded_pathogen_genome.num_unambiguous_sites = (
                consensus_genome.recovered_sites
            )
            sample.uploaded_pathogen_genome.num_mixed = consensus_genome.ambiguous_sites
            sample.uploaded_pathogen_genome.num_missing_alleles = (
                consensus_genome.missing_sites
            )
            sample.uploaded_pathogen_genome.sequencing_depth = (
                consensus_genome.avg_depth
            )
            sample.uploaded_pathogen_genome.sequence = consensus_genome.fasta

            if czbid.genome_submission_info is not None:
                if czbid.genome_submission_info.gisaid_accession is not None:
                    sample.uploaded_pathogen_genome.accessions.append(
                        Accession(
                            repository_type=PublicRepositoryType.GISAID,
                            public_identifier=czbid.genome_submission_info.gisaid_accession,
                        )
                    )
                if czbid.genome_submission_info.genbank_accession is not None:
                    sample.uploaded_pathogen_genome.accessions.append(
                        Accession(
                            repository_type=PublicRepositoryType.GENBANK,
                            public_identifier=czbid.genome_submission_info.genbank_accession,
                        )
                    )

            public_identifier_to_sample[sample.public_identifier] = sample

        pacific_time = pytz.timezone("US/Pacific")
        s3_src = boto3.session.Session(profile_name=s3_src_profile).resource("s3")
        s3_dst = boto3.session.Session(profile_name=s3_dst_profile).resource("s3")

        src_prefix_url = S3UrlParser(s3_src_prefix)
        dst_prefix_url = S3UrlParser(s3_dst_prefix)
        for key in list_bucket(s3_src, src_prefix_url.bucket, src_prefix_url.key):
            key_prefix_removed = key[len(src_prefix_url.key) :]
            key_mo = re.match(
                r".*_(?P<year>\d{2})(?P<month>\d{2})(?P<day>\d{2})\.json",
                key,
            )
            if key_mo is None:
                logger.warning(
                    f"S3 object s3://{src_prefix_url.bucket}/{key} does not conform to"
                    " expected filename structure."
                )
                continue
            year, month, day = (
                2000 + int(key_mo["year"]),
                int(key_mo["month"]),
                int(key_mo["day"]),
            )
            dt = pacific_time.localize(
                datetime.datetime(year=year, month=month, day=day, hour=12)
            )

            data = s3_src.Bucket(src_prefix_url.bucket).Object(key).get()["Body"].read()

            json_decoded = json.loads(data.decode())
            tree = [json_decoded["tree"]]

            all_public_identifiers = get_names_from_tree(tree)

            all_uploaded_pathogen_genomes: List[Entity] = list()
            for public_identifier in all_public_identifiers:
                sample = public_identifier_to_sample.get(public_identifier)
                if sample is not None:
                    uploaded_pathogen_genome = sample.uploaded_pathogen_genome
                    if uploaded_pathogen_genome is not None:
                        all_uploaded_pathogen_genomes.append(uploaded_pathogen_genome)

            phylo_tree = PhyloTree(
                s3_bucket=dst_prefix_url.bucket,
                s3_key=dst_prefix_url.key + key_prefix_removed,
            )
            s3_dst.Bucket(phylo_tree.s3_bucket).Object(phylo_tree.s3_key).put(Body=data)

            print(
                f"s3://{src_prefix_url.bucket}/{key} ==>"
                f" s3://{phylo_tree.s3_bucket}/{phylo_tree.s3_key}"
            )

            workflow = PhyloRun(
                group=group,
                start_datetime=dt,
                end_datetime=dt,
                workflow_status=WorkflowStatusType.COMPLETED,
                software_versions={},
                inputs=all_uploaded_pathogen_genomes,
            )
            workflow.outputs = [phylo_tree]
