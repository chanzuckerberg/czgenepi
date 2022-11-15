from datetime import datetime

from aspen.database.models import PublicRepositoryMetadata


def repo_metadata_factory(
    pathogen,
    repository,
    strain="some_identifier/hCoV-19",
    lineage="T",  # T for test
    isl="EPI_ISL_8675309",
    date=None,
    region="North America",  # Not necessarily in our Sample/RegionType enum
    division="California",
    location="Alameda County",
) -> PublicRepositoryMetadata:
    date = date or datetime.now()
    return PublicRepositoryMetadata(
        pathogen=pathogen,
        public_repository=repository,
        strain=strain,
        lineage=lineage,
        isl=isl,
        date=date,
        region=region,
        division=division,
        location=location,
    )
