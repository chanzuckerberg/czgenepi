import io
from typing import List, Optional

import click
import requests
import sqlalchemy as sa
from aspen.config.config import Config
from aspen.database.connection import (
    SqlAlchemyInterface,
    get_db_uri,
    init_db,
    session_scope,
)
from aspen.database.models import Pathogen, PathogenLineage
from aspen.workflows.shared_utils.database import (
    create_temp_table,
    drop_temp_table,
    mv_table_contents,
)


def download_lineages(
    url: str,
    format: str,
    list_path: List[str],
    lineage_keys: List[str],
    print_response: bool,
) -> List[str]:
    """Download lineages file from URL."""
    response = requests.get(url)
    if response.status_code != 200:
        raise RuntimeError(f"Error downloading lineages file: {response.text}")
    if print_response:
        print(response.text)
    results = set()
    if format == "json":
        data = response.json()
        for path in list_path:
            data = data[path]
        for item in data:
            for item_key in lineage_keys:
                if item_key in item:
                    results.add(item[item_key])
    return list(results)


def load_lineages_data(pathogen_slug, lineages: list[str]) -> None:
    """Loads all the lineages into DB.

    Approach to this is basically duplicating what's in
        backend/aspen/workflows/import_gisaid/save.py
    Idea is to load all the data into a temp table with same structure,
    then once all loaded, drop the rows from "real" table, move the new data
    over from the temp table, and finally drop the temp table to wrap up.

    The original import script deals with a lot more data, so that has some
    performance-specific bits that are not included in this version.
    """
    LINEAGE_COL_NAME = "lineage"

    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))
    with session_scope(interface) as session:
        pathogen = session.execute(sa.select(Pathogen).where(Pathogen.slug == pathogen_slug)).scalars().one()  # type: ignore

        dest_table = PathogenLineage.__table__
        temp_table = create_temp_table(session, dest_table)

        # Load data into temp_table
        lineage_objects = [
            {LINEAGE_COL_NAME: lineage, "pathogen_id": pathogen.id}
            for lineage in lineages
        ]
        session.execute(temp_table.insert(), lineage_objects)

        # Replace previous data with new data from temp_table
        mv_table_contents(
            session,
            temp_table,
            dest_table,
            [(PathogenLineage.pathogen_id == pathogen.id)],
        )
        drop_temp_table(session, temp_table)

        # Final sanity check before we commit
        count_db_lineages = (
            session.query(dest_table)
            .filter(PathogenLineage.pathogen_id == pathogen.id)
            .count()
        )
        print(f"Imported {count_db_lineages} lineage rows")
        if len(lineages) != count_db_lineages:
            raise RuntimeError("Something went wrong loading DB. Abort!")
            # This exception will bubble up, end session, cause rollback.

        session.commit()


@click.command()
@click.argument(
    "pathogen_slug",
    required=True,
)
@click.option(
    "--print-source-file",
    type=bool,
    is_flag=True,
    help="Print the list of lineages we got from the remote url",
)
@click.option(
    "--parse-without-import",
    type=bool,
    is_flag=True,
    help="Parse lineages file, but only print results instead of write to DB.",
)
@click.option(
    "--test",
    type=bool,
    is_flag=True,
    help="Run very basic smoke test.",
)
def cli(
    pathogen_slug: str,
    print_source_file: bool,
    parse_without_import: bool,
    test: bool,
):
    """Load lineages from a remote file into DB."""
    if test:
        print("Success!")
        return  # Do nothing other than basic smoke test

    urls = {
        "MPX": {
            "url": "https://raw.githubusercontent.com/mpxv-lineages/lineage-designation/master/auto-generated/lineages.json",
            "format": "json",
            "list_path": ["lineages"],
            "lineage_keys": ["name", "alias", "unaliased_name"],
        }
    }
    if not urls.get(pathogen_slug):
        raise RuntimeError(f"Pathogen slug '{pathogen_slug}' not supported")

    print("Parsing lineages data from file...")
    lineages = download_lineages(
        **urls[pathogen_slug], print_response=print_source_file
    )
    print(f"Found {len(lineages)} lineages in file")

    if parse_without_import:
        print("Printing lineages, but NOT importing to DB")
        print(lineages)
        return  # End here to avoid importing to DB

    print("Loading lineages to DB...")
    load_lineages_data(pathogen_slug, lineages)
    print("Loading lineages complete!")


if __name__ == "__main__":
    cli()
