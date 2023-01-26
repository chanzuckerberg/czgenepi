import datetime
from aspen.database.models.repository_workflows import AlignedRepositoryData

import click
import sqlalchemy as sa

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import Pathogen, PublicRepository


@click.command("save")
@click.option("--start-time", type=int, required=True)
@click.option("--genbank-s3-bucket", type=str, required=True)
@click.option("--genbank-sequences-s3-key", type=str, required=True)
@click.option("--genbank-metadata-s3-key", type=str, required=True)
@click.option("--pathogen-slug", type=str, default="MPX")
@click.option("--public_repository", type=str, default="GenBank")
@click.option("--test", type=bool, is_flag=True)
def cli(
    genbank_s3_bucket: str,
    genbank_sequences_s3_key: str,
    genbank_metadata_s3_key: str,
    pathogen_slug: str,
    public_repository: str,
    test: bool,
):
    if test:
        print("Success!")
        return

    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))

    with session_scope(interface) as session:
        pathogen_obj = Pathogen.get_by_slug(session, pathogen_slug)
        public_repository_obj = session.execute(sa.select(PublicRepository).where(PublicRepository.name == public_repository)).scalars().one()  # type: ignore
        aligned_data_entity = AlignedRepositoryData(
            pathogen=pathogen_obj,
            public_repository=public_repository_obj,
            s3_bucket=genbank_s3_bucket,
            sequences_s3_key=genbank_sequences_s3_key,
            metadata_s3_key=genbank_metadata_s3_key
        )

        session.add(aligned_data_entity)
        session.flush()

        print(aligned_data_entity.entity_id)


if __name__ == "__main__":
    cli()
