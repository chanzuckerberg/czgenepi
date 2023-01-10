import datetime

import click
import sqlalchemy as sa

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import Pathogen, PublicRepository, RawRepositoryData


@click.command("save")
@click.option("--start-time", type=int, required=True)
@click.option("--gisaid-s3-bucket", type=str, required=True)
@click.option("--gisaid-s3-key", type=str, required=True)
@click.option("--pathogen", type=str, default="SC2")
@click.option("--public_repository", type=str, default="GISAID")
@click.option("--test", type=bool, is_flag=True)
def cli(
    start_time: int,
    gisaid_s3_bucket: str,
    gisaid_s3_key: str,
    pathogen: str,
    public_repository: str,
    test: bool,
):
    if test:
        print("Success!")
        return
    start_time_datetime = datetime.datetime.fromtimestamp(start_time)

    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))
    with session_scope(interface) as session:

        pathogen_obj = session.execute(sa.select(Pathogen).where(Pathogen.slug == pathogen)).scalars().one()  # type: ignore
        public_repository_obj = session.execute(sa.select(PublicRepository).where(PublicRepository.name == public_repository)).scalars().one()  # type: ignore
        entity: RawRepositoryData = RawRepositoryData(
            pathogen=pathogen_obj,
            public_repository=public_repository_obj,
            download_date=start_time_datetime,
            s3_bucket=gisaid_s3_bucket,
            s3_key=gisaid_s3_key,
        )

        session.add(entity)
        session.flush()

        print(entity.entity_id)


if __name__ == "__main__":
    cli()
