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
    AlignedGisaidDump,
    AlignedRepositoryData,
    GisaidAlignmentWorkflow,
    Pathogen,
    ProcessedRepositoryData,
    PublicRepository,
    RepositoryAlignmentWorkflow,
    WorkflowStatusType,
)
from aspen.database.models.workflow import SoftwareNames


@click.command("save")
@click.option("--aspen-workflow-rev", type=str, required=True)
@click.option("--aspen-creation-rev", type=str, required=True)
@click.option("--ncov-rev", type=str, required=True)
@click.option("--aspen-docker-image-version", type=str, required=True)
@click.option("--start-time", type=int, required=True)
@click.option("--end-time", type=int, required=True)
@click.option("--processed-gisaid-object-id", type=int, required=True)
@click.option("--gisaid-s3-bucket", type=str, required=True)
@click.option("--gisaid-sequences-s3-key", type=str, required=True)
@click.option("--gisaid-metadata-s3-key", type=str, required=True)
@click.option("--pathogen", type=str, default="SC2")
@click.option("--public_repository", type=str, default="GISAID")
@click.option("--test", type=bool, is_flag=True)
def cli(
    aspen_workflow_rev: str,
    aspen_creation_rev: str,
    ncov_rev: str,
    aspen_docker_image_version: str,
    start_time: int,
    end_time: int,
    processed_gisaid_object_id: int,
    gisaid_s3_bucket: str,
    gisaid_sequences_s3_key: str,
    gisaid_metadata_s3_key: str,
    pathogen: str,
    public_repository: str,
    test: bool,
):
    if test:
        print("Success!")
        return
    start_time_datetime = datetime.datetime.fromtimestamp(start_time)
    end_time_datetime = datetime.datetime.fromtimestamp(end_time)

    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))
    with session_scope(interface) as session:
        pathogen_obj = session.execute(sa.select(Pathogen).where(Pathogen.slug == pathogen)).scalars().one()  # type: ignore
        public_repository_obj = session.execute(sa.select(PublicRepository).where(PublicRepository.name == public_repository)).scalars().one()  # type: ignore

        processed_entity: ProcessedRepositoryData = (
            session.query(ProcessedRepositoryData)
            .filter(ProcessedRepositoryData.id == processed_gisaid_object_id)
            .one()
        )

        # create an output
        aligned_data_entity = AlignedRepositoryData(
            pathogen=pathogen_obj,
            public_repository=public_repository_obj,
            s3_bucket=gisaid_s3_bucket,
            sequences_s3_key=gisaid_sequences_s3_key,
            metadata_s3_key=gisaid_metadata_s3_key,
        )

        # attach a workflow
        workflow = RepositoryAlignmentWorkflow(
            pathogen=pathogen_obj,
            public_repository=public_repository_obj,
            start_datetime=start_time_datetime,
            end_datetime=end_time_datetime,
            workflow_status=WorkflowStatusType.COMPLETED,
            software_versions={
                SoftwareNames.ASPEN_WORKFLOW: aspen_workflow_rev,
                SoftwareNames.ASPEN_CREATION: aspen_creation_rev,
                SoftwareNames.NCOV: ncov_rev,
                SoftwareNames.ASPEN_DOCKER_IMAGE: aspen_docker_image_version,
            },
        )

        workflow.inputs.append(processed_entity)
        workflow.outputs.append(aligned_data_entity)
        session.flush()
        session.flush()

        # TODO - these tables are deprecated, please remove this block once we're reading from new tables
        session.execute(
            AlignedGisaidDump.__table__.insert().values(
                entity_id=aligned_data_entity.id,
                s3_bucket=gisaid_s3_bucket,
                sequences_s3_key=gisaid_sequences_s3_key,
                metadata_s3_key=gisaid_metadata_s3_key,
            )
        )
        session.execute(
            GisaidAlignmentWorkflow.__table__.insert().values(
                workflow_id=workflow.id,
            )
        )
        # End deprecated inserts

        print(aligned_data_entity.entity_id)


if __name__ == "__main__":
    cli()
