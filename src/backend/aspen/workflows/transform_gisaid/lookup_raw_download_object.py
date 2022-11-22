import json

import click

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import Pathogen, PublicRepository, RawRepositoryData


@click.command("lookup")
@click.option("--raw-download-object-id", type=int, required=True)
@click.option("--pathogen", type=str, default="SC2")
@click.option("--public_repository", type=str, default="GISAID")
def cli(
    raw_download_object_id: int,
    pathogen: str,
    public_repository: str,
):
    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))

    with session_scope(interface) as session:
        raw_download: RawRepositoryData = (
            session.query(RawRepositoryData)
            .join(RawRepositoryData.pathogen)
            .join(RawRepositoryData.public_repository)
            .filter(RawRepositoryData.id == raw_download_object_id)
            .filter(Pathogen.slug == pathogen)
            .filter(PublicRepository.name == public_repository)
            .one()
        )

        print(
            json.dumps(
                {
                    "bucket": raw_download.s3_bucket,
                    "key": raw_download.s3_key,
                }
            )
        )


if __name__ == "__main__":
    cli()
