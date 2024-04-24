import io
from typing import Optional

import click
import sqlalchemy as sa

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import Pathogen, PathogenLineage
from aspen.workflows.shared_utils.database import (
    create_temp_table,
    drop_temp_table,
    mv_table_contents,
)


def extract_lineage_from_line(line: str, exclude_withdrawn=True) -> Optional[str]:
    """
    Extracts the lineage name from one of the lineage_notes.txt lines.

    Most lines look like this
        Q.3	Alias of B.1.1.7.3, USA lineage, from pango-designation issue #92
        (note, that's a tab character after `Q.3`)
    Some lineages are "Withdrawn". This is denoted by a `*` at lineage start
        *B.1.1.156	Withdrawn: South African lineage
        (note, that's a tab character after `*B.1.1.156`)

    In general, from talking with Alli Black, it appears that we should be fine
    to only ever care about non-withdrawn lineages. Similarly, we can ignore
    any "alias" names mentioned (eg, `B.1.1.7.3` above), the alias name is more
    of an academic understanding, not something used for identification.

    Returns:
        str OR None: Lineage for the line OR None if line should be ignored
    """
    # Just skip empty lines.
    if not line.strip():
        return None
    lineage_chunk = line.split()[0]
    if exclude_withdrawn and lineage_chunk[0] == "*":
        return None
    return lineage_chunk


def safety_check_first_line(first_line: str) -> None:
    """Inspects first line of lineage_notes.txt to perform safety check.

    We pull all of our Pango lineages from a human-edited .txt file.
    The format has been stable so far, but if things ever change significantly,
    the planned loading process will probably explode. In case of changes,
    we will need to investigate and alter the loading process.

    This check exists to avoid ever accidentally loading a file where the
    format has (probably) changed. Assumption is that if the first line has
    changed from what it used to be, the file format has probably changed.
    Will print the problem and raise an exception.

    Raises:
        RuntimeError -- If first line of file not what was expected.
    """
    EXPECTED_FIRST_LINE = "Lineage\tDescription\n"
    if first_line != EXPECTED_FIRST_LINE:
        print("First line of imported lineages file has changed!")
        print("Loading script was originally written for previous version.")
        print(f"Expected: '{EXPECTED_FIRST_LINE}'")
        print(f"Actually got first line: '{first_line}'")
        print("Very likely you need to rewrite loading script. Aborting.")
        raise RuntimeError("Format of lineage file has likely changed")
    return None


def get_lineages(lineage_notes_file: io.TextIOBase) -> list[str]:
    """Extracts all current Pango lineages from lineage_notes file.

    Talking to Pangolin folks, they said the best canonical listing of all
    current lineages is to use their (manually updated) lineage_notes.txt
    https://github.com/cov-lineages/pango-designation/issues/456

    This function takes that file and parses out list of lineages.
    """
    # First line is header, no lineage data, but we use as a safety check.
    first_line = next(lineage_notes_file)
    first_line = first_line.replace(
        " ", ""
    )  # remove any extra spaces that could interfere with safety check
    safety_check_first_line(first_line)

    # Now we parse remainder of lines from file and extract lineages
    return [
        lineage
        for line in lineage_notes_file
        if (lineage := extract_lineage_from_line(line)) is not None
    ]


def load_lineages_data(lineages: list[str]) -> None:
    """Loads all the lineages into DB.

    Approach to this is basically duplicating what's in
        backend/aspen/workflows/import_gisaid/save.py
    Idea is to load all the data into a temp table with same structure,
    then once all loaded, drop the rows from "real" table, move the new data
    over from the temp table, and finally drop the temp table to wrap up.

    Original GISAID import deals with a lot more data, so that has some
    performance-specific bits that are not included in this version.
    """
    LINEAGE_COL_NAME = "lineage"

    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))
    with session_scope(interface) as session:
        pathogen = session.execute(sa.select(Pathogen).where(Pathogen.slug == "SC2")).scalars().one()  # type: ignore

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
@click.option(
    "pango_lineages_file",
    "--lineages-file",
    type=click.File("r"),
    required=True,
    help="Pango lineages file to parse and import.",
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
    pango_lineages_file: io.TextIOBase,
    parse_without_import: bool,
    test: bool,
):
    """Parse provided lineage_notes from Pangolin, load into DB."""
    if test:
        print("Success!")
        return  # Do nothing other than basic smoke test

    print("Parsing lineages data from file...")
    lineages = get_lineages(pango_lineages_file)
    print(f"Found {len(lineages)} lineages in file")

    if parse_without_import:
        print("Printing lineages, but NOT importing to DB")
        print(lineages)
        return  # End here to avoid importing to DB

    print("Loading Pango lineages to DB...")
    load_lineages_data(lineages)
    print("Loading Pango lineages complete!")


if __name__ == "__main__":
    cli()
