import re
import uuid
from typing import Iterable, Optional

from sqlalchemy import Column, MetaData, Table
from sqlalchemy.orm.session import Session
from sqlalchemy.schema import CreateTable, DropTable
from sqlalchemy.sql.elements import ClauseElement

# Used in names of temp tables to show intention to be temporary.
TEMPORARY_INDICATOR = "temporary"


def create_temp_table(session: Session, source_table: Table) -> Table:
    """Creates new table, structured same as source. Intended to be temporary.

    Intent is for the returned table to be temporary, but that is not enforced
    by this function. Calling this function will create a new table in the DB.
    If that table is not dropped later in the script (or dropped via rollback),
    it will stick around.
    """
    metadata = MetaData()
    # Random to avoid name collisions; `-` stripped b/c bad for table name
    suffix = re.sub("-", "", str(uuid.uuid1()))
    table_name = f"{source_table.name}_{TEMPORARY_INDICATOR}_{suffix}"
    cols = []
    for col in source_table.columns:
        cols.append(
            Column(
                col.name, col.type, primary_key=col.primary_key, nullable=col.nullable
            )
        )

    table_object = Table(table_name, metadata, *cols)
    session.execute(CreateTable(table_object))
    return table_object


def mv_table_contents(
    session: Session,
    source_table: Table,
    dest_table: Table,
    filters: Optional[Iterable[ClauseElement]] = None,
) -> None:
    """Deletes contents of dest, copies in contents from source to dest.

    WARNING: This function is destructive for the data in dest_table.
    All the data that dest_table starts with will be dropped as part
    of copying in the incoming data from source_table.
    """
    cols = [col.name for col in dest_table.columns]
    delete_query = dest_table.delete()
    if filters is not None:
        delete_query = delete_query.where(*filters)
    session.execute(delete_query)
    session.execute(dest_table.insert().from_select(cols, source_table.select()))


def drop_temp_table(
    session: Session, table_obj: Table, check_is_temp: bool = True
) -> None:
    """Drops table. Intended to be used on temporary tables only.

    Performs a basic safety check (if `check_is_temp` on) to verify the table's
    name indicates it is indeed a temporary table. Will raise exception if not.
    """
    if check_is_temp and TEMPORARY_INDICATOR not in table_obj.name:
        raise ValueError(
            "Not allowed to drop a non-temporary table. "
            + "If this is necessary, please disable safety check."
        )
    # mypy stubs (`sqlalchemy-stubs`) mistakenly set the DropTable type as
    # `str`, but SQLAlchemy actually expects a Table object for it.
    session.execute(DropTable(table_obj))  # type: ignore[arg-type]
