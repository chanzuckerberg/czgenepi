# flake8: noqa: E711
# Doing a double-equals comparison to None is critical for the statements
# that use it to compile to the intended SQL, which is why tell flake8 to
# ignore rule E711 at the top of this file

import click
import sqlalchemy as sa
from sqlalchemy import exists
from sqlalchemy.dialects import postgresql
from sqlalchemy.orm import aliased
from sqlalchemy.sql.expression import and_

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import Location, Pathogen, PublicRepositoryMetadata


def get_metadata_query(pathogen_slug, division=True, location=True):
    fields = [PublicRepositoryMetadata.region, PublicRepositoryMetadata.country]
    where_clauses = [
        (Pathogen.slug == pathogen_slug),
        (PublicRepositoryMetadata.region != None),
        (PublicRepositoryMetadata.region != ""),
        (PublicRepositoryMetadata.country != None),
        (PublicRepositoryMetadata.country != ""),
    ]
    location_alias = aliased(Location)
    # Since postgresql treats all null values as not-comparable, we can't use our
    # unique index to ensure that we don't wind up with duplicate rows in the
    # locations database. We're working around that by *checking to see* if we
    # already have a matching row before selecting data for insert. This is a
    # step in the right direction, but it is not safe for concurrent inserts!
    # The better solution is to upgrade to psql15 and use their new null-friendly indexes:
    # https://pganalyze.com/blog/5mins-postgres-unique-constraint-null-parallel-distinct
    not_exists_clauses = [
        (PublicRepositoryMetadata.region == location_alias.region),
        (PublicRepositoryMetadata.country == location_alias.country),
    ]
    if division:
        fields.append(PublicRepositoryMetadata.division)
        not_exists_clauses.append(
            PublicRepositoryMetadata.division == location_alias.division
        )
        where_clauses.extend(
            [
                (PublicRepositoryMetadata.division != ""),
                (PublicRepositoryMetadata.division != None),
            ]
        )
    else:
        not_exists_clauses.append(location_alias.division == None)
        fields.append(None)
    if location:
        fields.append(PublicRepositoryMetadata.location)
        not_exists_clauses.append(
            PublicRepositoryMetadata.division == location_alias.division
        )
        where_clauses.extend(
            [
                (PublicRepositoryMetadata.location != ""),
                (PublicRepositoryMetadata.location != None),
            ]
        )
    else:
        not_exists_clauses.append(location_alias.location == None)
        fields.append(None)

    exists_query = (
        sa.select(location_alias.id).where(and_(*not_exists_clauses)).exists()
    )
    metadata_locations_select = (
        sa.select(*fields)
        .join(Pathogen)
        .filter(~exists_query)
        .where(and_(*where_clauses))
        .distinct()
    )
    return metadata_locations_select


def run_insert_select(session, select_query):
    metadata_locations_insert = (
        postgresql.insert(Location.__table__)
        .from_select(["region", "country", "division", "location"], select_query)
        .on_conflict_do_nothing(
            index_elements=("region", "country", "division", "location")
        )
    )
    session.execute(metadata_locations_insert)


def save(pathogen_slug: str):
    config = Config()
    interface: SqlAlchemyInterface = init_db(get_db_uri(config))

    with session_scope(interface) as session:
        # Insert all locations from public_repository_metadata
        all_locations = get_metadata_query(pathogen_slug)
        run_insert_select(session, all_locations)

        # Insert an entry with a null location for every distinct Region/Country/Division combination
        all_divisions = get_metadata_query(pathogen_slug, location=False)
        run_insert_select(session, all_divisions)

        # Insert country-level locations
        all_countries = get_metadata_query(
            pathogen_slug, division=False, location=False
        )
        run_insert_select(session, all_countries)

        session.commit()

    print("Successfully imported locations!")


@click.command("save")
@click.option("--test", type=bool, is_flag=True)
@click.option("--pathogen", type=str, default="SC2")
def cli(test: bool, pathogen: str):
    if test:
        print("Success!")
        return
    save(pathogen)


if __name__ == "__main__":
    cli()
