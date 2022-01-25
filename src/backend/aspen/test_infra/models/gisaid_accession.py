from aspen.database.models import Accession, AccessionType


def gisaid_accession_factory(sample, isl_accession_number):
    return Accession(
        accession_type=AccessionType.GISAID_ISL,
        accession=isl_accession_number,
        sample_id=sample.id,
    )
