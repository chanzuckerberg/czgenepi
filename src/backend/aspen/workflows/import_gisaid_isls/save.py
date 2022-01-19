# flake8: noqa: E711
# Doing a double-equals comparison to None is critical for the statements
# that use it to compile to the intended SQL, which is why tell flake8 to
# ignore rule E711 at the top of this file

import click
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy.sql.expression import and_

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import Accessions, GisaidMetadata, Sample


def save():
    config = Config()
    interface: SqlAlchemyInterface = init_db(get_db_uri(config))

    with session_scope(interface) as session:
        subquery = (
            sa.select(Sample.id, GisaidMetadata.gisaid_epi_isl)
            .select_from(Sample)
            .join(GisaidMetadata, Sample.public_identifier == GisaidMetadata.strain)
            .subquery()
        )

        update_accessions_stmt = (
            sa.update(Accessions)
            .values(gisaid_isl=subquery.c.gisaid_epi_isl)
            .where(Accessions.sample_id == subquery.c.id)
            .execution_options(synchronize_session=False)
        )

        result = session.execute(update_accessions_stmt)

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
