# flake8: noqa: E711
# Doing a double-equals comparison to None is critical for the statements
# that use it to compile to the intended SQL, which is why tell flake8 to
# ignore rule E711 at the top of this file

from aspen.database.models.public_repositories import PublicRepository
import click
import sqlalchemy as sa
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.sql.expression import literal_column

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import (
    Accession,
    AccessionType,
    PublicRepositoryMetadata,
    Sample,
    Pathogen,
    PublicRepository,
    PathogenRepoConfig
)


def save(pathogen_slug, public_repository):
    config = Config()
    interface: SqlAlchemyInterface = init_db(get_db_uri(config))

    with session_scope(interface) as session:
        # Note: the syntax of the literal_column() is purposefully done so the resulting
        # PostgreSQL expression will have single-quotes around it, since we are
        # SELECTing on a string literal (this is done in order to give every row in this subquery
        # the value 'GISAID_ISL' in the 'accession_type' column.)
        pathogen_obj = session.execute(sa.select(Pathogen).where(Pathogen.slug == pathogen_slug)).scalars().one()  # type: ignore
        pathogen_repo_config_obj = session.execute(
            sa.select(PathogenRepoConfig)
            .join(PathogenRepoConfig.pathogen)
            .join(PathogenRepoConfig.public_repository).where(
            Pathogen.slug == pathogen_slug, PublicRepository.name == public_repository
            )).scalars().one()  # type: ignore
        prefix = f"^{pathogen_repo_config_obj.prefix}/"

        if public_repository == "GISAID":
            accession_type = AccessionType.GISAID_ISL.value

        if public_repository == "GenBank":
            accession_type = AccessionType.GENBANK.value

        subquery = (
            sa.select(
                Sample.id,
                literal_column(f"'{accession_type}'").label(
                    "accession_type"
                ),
                PublicRepositoryMetadata.isl,
            )
            .select_from(Sample)
            .join(
                PublicRepositoryMetadata,
                func.regexp_replace(Sample.public_identifier, prefix, "", "i")
                == PublicRepositoryMetadata.strain,
            )
            .where(
                Sample.pathogen_id == pathogen_obj.id
            )
            .subquery()
        )

        insert_accessions_stmt = insert(Accession.__table__).from_select(
            ["sample_id", "accession_type", "accession"], subquery
        )

        do_update_stmt = insert_accessions_stmt.on_conflict_do_update(
            constraint="uq_accessions_sample_id_accession_type",
            set_=dict(accession=insert_accessions_stmt.excluded.accession),
        )

        result = session.execute(do_update_stmt)

        session.commit()

        print(f"Successfully imported {result.rowcount} ISLs!")


@click.command("save")
@click.option("--test", type=bool, is_flag=True)
@click.option("--pathogen-slug", type=str, default="SC2")
@click.option("--public-repository", type=str, default="GISAID")
def cli(test: bool, pathogen_slug: str, public_repository: str):
    if test:
        print("Success!")
        return
    save(pathogen_slug, public_repository)


if __name__ == "__main__":
    cli()
