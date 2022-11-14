import json

import click

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import Pathogen, ProcessedRepositoryData, PublicRepository


@click.command("lookup")
@click.option("--processed-object-id", type=int, required=True)
@click.option("--pathogen", type=str, default="SC2")
@click.option("--public_repository", type=str, default="GISAID")
def cli(
    processed_object_id: int,
    pathogen: str,
    public_repository: str,
):
    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))

    with session_scope(interface) as session:
        processed_data: ProcessedRepositoryData = (
            session.query(ProcessedRepositoryData)
            .join(ProcessedRepositoryData.pathogen)
            .join(ProcessedRepositoryData.public_repository)
            .filter(ProcessedRepositoryData.id == processed_object_id)
            .filter(Pathogen.slug == pathogen)
            .filter(PublicRepository.name == public_repository)
            .one()
        )

        print(
            json.dumps(
                {
                    "bucket": processed_data.s3_bucket,
                    "sequences_key": processed_data.sequences_s3_key,
                    "metadata_key": processed_data.metadata_s3_key,
                }
            )
        )


if __name__ == "__main__":
    cli()
