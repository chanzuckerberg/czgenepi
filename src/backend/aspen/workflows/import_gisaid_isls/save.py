# flake8: noqa: E711
# Doing a double-equals comparison to None is critical for the statements
# that use it to compile to the intended SQL, which is why tell flake8 to
# ignore rule E711 at the top of this file

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
)


def save():
    config = Config()
    interface: SqlAlchemyInterface = init_db(get_db_uri(config))

    with session_scope(interface) as session:
        # Note: the syntax of the literal_column() is purposefully done so the resulting
        # PostgreSQL expression will have single-quotes around it, since we are
        # SELECTing on a string literal (this is done in order to give every row in this subquery
        # the value 'GISAID_ISL' in the 'accession_type' column.)
        subquery = (
            sa.select(
                Sample.id,
                literal_column(f"'{AccessionType.GISAID_ISL.value}'").label(
                    "accession_type"
                ),
                PublicRepositoryMetadata.isl,
            )
            .select_from(Sample)
            .join(
                PublicRepositoryMetadata,
                func.regexp_replace(Sample.public_identifier, "^hcov-19/", "", "i")
                == PublicRepositoryMetadata.strain,
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
def cli(test: bool):
    if test:
        print("Success!")
        return
    save()


if __name__ == "__main__":
    cli()
