from typing import Optional

import click


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


def get_lineages(lineage_notes_filename: str) -> list[str]:
    """DOCME"""
    with open(lineage_notes_filename) as f:
        # First line is header, no lineage data, but we use as a safety check.
        first_line = next(f)
        safety_check_first_line(first_line)
        # Now we parse remainder of lines from file and extract lineages
        return [
            extract_lineage_from_line(line)
            for line in f
            # Not all lines should have a lineage extracted, see function
            if extract_lineage_from_line(line)
        ]


@click.command()
@click.option(
    "--parse-without-import",
    type=bool,
    is_flag=True,
    help="Parse lineages file, but print results instead of writing to DB.",
)
@click.argument(
    "pango_lineages_filename",
    required=True,
)
def cli(parse_without_import: bool, pango_lineages_filename: str):
    """
    Parse provided lineage_notes from Pangolin, load into DB.

    PANGO_LINEAGES_FILENAME: Needs to be in same directory as this script.
    """
    lineages = get_lineages(pango_lineages_filename)
    print(f"Found {len(lineages)} lineages in file")
    if parse_without_import:
        print("Printing lineages, but NOT importing to DB")
        print(lineages)
        return  # End here to avoid doing import
    # TODO
    print("Let's do this, boss!")


if __name__ == "__main__":
    cli()
