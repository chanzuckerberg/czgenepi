import datetime

from aspen.database.models import PublicRepositoryType


def gisaid_accession_factory(uploaded_pathogen_genome, isl_accession_number):
    uploaded_pathogen_genome.add_accession(
        repository_type=PublicRepositoryType.GISAID,
        public_identifier=isl_accession_number,
        workflow_start_datetime=datetime.datetime.now(),
        workflow_end_datetime=datetime.datetime.now(),
    )
