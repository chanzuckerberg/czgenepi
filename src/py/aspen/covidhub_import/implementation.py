import logging
import warnings
from typing import Collection, Mapping

import tqdm
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
from sqlalchemy import and_, or_
from sqlalchemy.orm import joinedload, Session

from aspen.database.connection import session_scope, SqlAlchemyInterface
from aspen.database.models import Group, Sample, UploadedPathogenGenome

logger = logging.getLogger(__name__)


def covidhub_interface_from_secret(secret_id: str) -> CSqlAlchemyInterface:
    interface = Cinit_db(Cutil.get_db_uri(secret_id))
    return interface


def import_project(
    interface: SqlAlchemyInterface,
    covidhub_secret_id: str,
    rr_project_id: str,
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

        logger.info("Creating new objects...")
        for consensus_genome in tqdm.tqdm(consensus_genomes):
            czbid = consensus_genome.sample_fastqs.czb_id
            if not isinstance(czbid, DphCZBID):
                warnings.warn(
                    "consensus genome has non-dphczbid"
                    f"{consensus_genome.sample_fastqs.czb_id}"
                )
                continue
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
