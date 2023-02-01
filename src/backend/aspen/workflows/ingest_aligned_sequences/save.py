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
from aspen.database.models import (
    Pathogen,
    PublicRepository,
    RepositoryAlignmentWorkflow,
    WorkflowStatusType,
)
from aspen.database.models.repository_workflows import AlignedRepositoryData


@click.command("save")
@click.option("--genbank-s3-bucket", type=str, required=True)
@click.option("--genbank-sequences-s3-key", type=str, required=True)
@click.option("--genbank-metadata-s3-key", type=str, required=True)
@click.option("--pathogen-slug", type=str, default="MPX")
@click.option("--public-repository", type=str, default="GenBank")
@click.option("--start-time", type=int, required=True)
@click.option("--end-time", type=int, required=True)
@click.option("--test", type=bool, is_flag=True)
def cli(
    genbank_s3_bucket: str,
    genbank_sequences_s3_key: str,
    genbank_metadata_s3_key: str,
    pathogen_slug: str,
    public_repository: str,
    start_time: int,
    end_time: int,
    test: bool,
):
    if test:
        print("Success!")
        return

    start_time_datetime = datetime.datetime.fromtimestamp(start_time)
    end_time_datetime = datetime.datetime.fromtimestamp(end_time)
    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))

    with session_scope(interface) as session:
        pathogen_obj = (
            session.execute(sa.select(Pathogen).where(Pathogen.slug == pathogen_slug))
            .scalars()
            .one()
        )  # type: ignore
        public_repository_obj = (
            session.execute(
                sa.select(PublicRepository).where(
                    PublicRepository.name == public_repository
                )
            )
            .scalars()
            .one()
        )  # type: ignore

        # create an output
        aligned_data_entity = AlignedRepositoryData(
            pathogen=pathogen_obj,
            public_repository=public_repository_obj,
            s3_bucket=genbank_s3_bucket,
            sequences_s3_key=genbank_sequences_s3_key,
            metadata_s3_key=genbank_metadata_s3_key,
        )

        # attach a workflow
        workflow = RepositoryAlignmentWorkflow(
            pathogen=pathogen_obj,
            public_repository=public_repository_obj,
            start_datetime=start_time_datetime,
            end_datetime=end_time_datetime,
            workflow_status=WorkflowStatusType.COMPLETED,
            software_versions={},
        )

        workflow.outputs.append(aligned_data_entity)

        session.add(aligned_data_entity)
        session.flush()

        print(aligned_data_entity.entity_id)


if __name__ == "__main__":
    cli()
